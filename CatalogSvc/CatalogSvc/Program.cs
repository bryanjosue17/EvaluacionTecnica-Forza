using System.Data;
using System.Text.Json.Serialization;
using CatalogSvc.Models;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using JsonOptions = Microsoft.AspNetCore.Mvc.JsonOptions;

var builder = WebApplication.CreateBuilder(args);

// ============= CONFIGURACIÓN GENERAL =============

// 1) Connection string desde appsettings o secrets
var cs = builder.Configuration.GetConnectionString("Sql")
          ?? throw new InvalidOperationException("ConnectionStrings:Sql no está configurado.");

// 2) Registrar DbContext en DI
builder.Services.AddDbContext<CatalogDbContext>(o =>
    o.UseSqlServer(cs, sql => sql.EnableRetryOnFailure())
);

// 3) Configurar opciones JSON
builder.Services.Configure<JsonOptions>(o =>
{
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// ?? ESTE era el problema: antes usabas WebApplication.Create()
// Debe ser builder.Build() para que el DI esté listo
var app = builder.Build();

// Health check
app.MapGet("/", () => Results.Ok(new { svc = "CatalogSvc", ok = true }));

// ==================== ENDPOINTS ====================

// LISTA
app.MapGet("/catalog/products",
    async ([FromServices] CatalogDbContext db,
           [FromQuery] string? search,
           [FromQuery] int page = 1,
           [FromQuery] int size = 20) =>
    {
        page = page <= 0 ? 1 : page;
        size = size <= 0 ? 20 : size;

        var rows = await db.Set<ProductListRow>()
            .FromSqlRaw(
                "EXEC dbo.usp_Product_List @Search, @Page, @Size",
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@Page", page),
                new SqlParameter("@Size", size)
            )
            .AsNoTracking()
            .ToListAsync();

        var total = rows.FirstOrDefault()?.Total ?? 0;

        var items = rows.Select(r => new ProductDto
        {
            Id = r.Id,
            Name = r.Name!,
            Description = r.Description,
            Price = r.Price,
            ImageUrl = r.ImageUrl,
            CreatedAt = r.CreatedAt
        }).ToList();

        return Results.Ok(new { page, size, total, items });
    });

// DETALLE
app.MapGet("/catalog/products/{id:int}",
    async ([FromServices] CatalogDbContext db, [FromRoute] int id) =>
    {
        var rows = await db.Set<ProductRow>()
            .FromSqlRaw("EXEC dbo.usp_Product_Get @Id", new SqlParameter("@Id", id))
            .AsNoTracking()
            .ToListAsync();

        if (rows.Count == 0) return Results.NotFound();

        var r = rows[0];
        var dto = new ProductDto
        {
            Id = r.Id,
            Name = r.Name!,
            Description = r.Description,
            Price = r.Price,
            ImageUrl = r.ImageUrl,
            CreatedAt = r.CreatedAt
        };
        return Results.Ok(dto);
    });

// STOCK (ExecuteScalar)
app.MapGet("/catalog/stock/{productId:int}",
    async ([FromServices] CatalogDbContext db, [FromRoute] int productId) =>
    {
        await using var cn = db.Database.GetDbConnection();
        await cn.OpenAsync();

        await using var cmd = cn.CreateCommand();
        cmd.CommandText = "dbo.usp_Inventory_GetStock";
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.Add(new SqlParameter("@ProductId", productId));

        var obj = await cmd.ExecuteScalarAsync();
        if (obj == null || obj == DBNull.Value) return Results.NotFound();

        var stock = Convert.ToInt32(obj);
        return Results.Ok(new { productId, stock });
    });

// CREATE
app.MapPost("/catalog/products",
    async ([FromServices] CatalogDbContext db, [FromBody] ProductCreateDto dto) =>
    {
        var rows = await db.Set<IdRow>()
            .FromSqlRaw(
                "EXEC dbo.usp_Product_Create @Name, @Description, @Price, @ImageUrl",
                new SqlParameter("@Name", dto.Name),
                new SqlParameter("@Description", (object?)dto.Description ?? DBNull.Value),
                new SqlParameter("@Price", dto.Price),
                new SqlParameter("@ImageUrl", (object?)dto.ImageUrl ?? DBNull.Value)
            )
            .AsNoTracking()
            .ToListAsync();

        var newId = rows.First().Id;
        return Results.Created($"/catalog/products/{newId}", new { id = newId });
    });

// UPDATE
app.MapPut("/catalog/products/{id:int}",
    async ([FromServices] CatalogDbContext db, [FromRoute] int id, [FromBody] ProductCreateDto dto) =>
    {
        var rows = await db.Set<AffectedRow>()
            .FromSqlRaw(
                "EXEC dbo.usp_Product_Update @Id, @Name, @Description, @Price, @ImageUrl",
                new SqlParameter("@Id", id),
                new SqlParameter("@Name", dto.Name),
                new SqlParameter("@Description", (object?)dto.Description ?? DBNull.Value),
                new SqlParameter("@Price", dto.Price),
                new SqlParameter("@ImageUrl", (object?)dto.ImageUrl ?? DBNull.Value)
            )
            .AsNoTracking()
            .ToListAsync();

        var affected = rows.FirstOrDefault()?.Affected ?? 0;
        return affected == 0 ? Results.NotFound() : Results.NoContent();
    });

// DELETE
app.MapDelete("/catalog/products/{id:int}",
    async ([FromServices] CatalogDbContext db, [FromRoute] int id) =>
    {
        var rows = await db.Set<AffectedRow>()
            .FromSqlRaw("EXEC dbo.usp_Product_Delete @Id", new SqlParameter("@Id", id))
            .AsNoTracking()
            .ToListAsync();

        var affected = rows.FirstOrDefault()?.Affected ?? 0;
        return affected == 0 ? Results.NotFound() : Results.NoContent();
    });

// Ejecución
app.Run("http://localhost:5002");

// DTOs
public class ProductCreateDto
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
}

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
