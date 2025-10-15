// File: OrderSvc/Program.cs
using System.Data;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrderSvc.Data;
using OrderSvc.Models;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

// ================== CONFIG OBLIGATORIA ==================
string cs = cfg.GetConnectionString("Sql")
    ?? throw new InvalidOperationException("Falta ConnectionStrings:Sql");

string jwtIssuer = cfg["Jwt:Issuer"]
    ?? throw new InvalidOperationException("Falta Jwt:Issuer");
string jwtAudience = cfg["Jwt:Audience"]
    ?? throw new InvalidOperationException("Falta Jwt:Audience");
string jwtSecretRaw = cfg["Jwt:Secret"]
    ?? throw new InvalidOperationException("Falta Jwt:Secret");

var signingKey = BuildSymmetricKey(jwtSecretRaw.Trim());

// ================== SERVICES ==================
builder.Services.AddDbContext<OrderDbContext>(o =>
    o.UseSqlServer(cs, sql => sql.EnableRetryOnFailure())
);

const string CorsPolicy = "spa";
builder.Services.AddCors(o =>
{
    o.AddPolicy(CorsPolicy, p =>
        p.WithOrigins("http://localhost:4200")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = signingKey
        };
    });

builder.Services.AddAuthorization();

// ================== APP ==================
var app = builder.Build();

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new { svc = "OrderSvc", ok = true })).AllowAnonymous();

// ================== HELPERS ==================
static SymmetricSecurityKey BuildSymmetricKey(string secret)
{
    byte[] keyBytes = secret.StartsWith("base64:", StringComparison.OrdinalIgnoreCase)
        ? Convert.FromBase64String(secret["base64:".Length..])
        : Encoding.UTF8.GetBytes(secret);

    if (keyBytes.Length < 32) // HS256 ≥ 32 bytes
        throw new InvalidOperationException($"Jwt:Secret debe tener >= 32 bytes. Actual: {keyBytes.Length}");
    return new SymmetricSecurityKey(keyBytes);
}

static int GetUserId(HttpContext http)
{
    var sub = http.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? http.User.FindFirstValue("sub");
    if (string.IsNullOrWhiteSpace(sub)) throw new UnauthorizedAccessException("No user id in token");
    return int.Parse(sub);
}

// ======================================================================
// ================   RUTAS DE CARRITO (100% via SP)   ===================
// ======================================================================

var cart = app.MapGroup("/orders/cart").RequireAuthorization();

// GET /orders/cart  -> dbo.usp_Cart_Get
cart.MapGet("/", async (HttpContext http, OrderDbContext db) =>
{
    var userId = GetUserId(http);

    await using var cn = db.Database.GetDbConnection();
    await cn.OpenAsync();

    await using var cmd = cn.CreateCommand();
    cmd.CommandText = "dbo.usp_Cart_Get";
    cmd.CommandType = CommandType.StoredProcedure;
    cmd.Parameters.Add(new SqlParameter("@UserId", userId));

    int? cartId = null;
    var items = new List<dynamic>();

    await using (var rd = await cmd.ExecuteReaderAsync())
    {
        // 1er resultset: encabezado de carrito
        if (rd.HasRows && await rd.ReadAsync())
        {
            cartId = rd.IsDBNull(rd.GetOrdinal("Id")) ? (int?)null : rd.GetInt32(rd.GetOrdinal("Id"));
        }

        // 2do resultset: items
        if (await rd.NextResultAsync())
        {
            while (await rd.ReadAsync())
            {
                var unitPrice = rd.GetDecimal(rd.GetOrdinal("UnitPrice"));
                var qty = rd.GetInt32(rd.GetOrdinal("Qty"));

                // ⬇⬇⬇ IMPORTANTE: exponer itemId para el front
                items.Add(new
                {
                    itemId = rd.GetInt32(rd.GetOrdinal("Id")),       // antes se exponía "Id"
                    productId = rd.GetInt32(rd.GetOrdinal("ProductId")),
                    name = rd.GetString(rd.GetOrdinal("Name")),
                    unitPrice = unitPrice,
                    qty = qty,
                    lineTotal = unitPrice * qty
                });
            }
        }
    }

    var total = items.Sum(x => (decimal)x.lineTotal);
    return Results.Ok(new { cartId, items, total });
});

// POST /orders/cart/items  -> dbo.usp_Cart_AddOrMergeItem
cart.MapPost("/items", async (HttpContext http, OrderDbContext db, AddItemReq req) =>
{
    if (req.Qty <= 0) return Results.BadRequest("Qty must be > 0");
    if (req.UnitPrice < 0) return Results.BadRequest("UnitPrice must be >= 0");

    var userId = GetUserId(http);

    await using var cn = db.Database.GetDbConnection();
    await cn.OpenAsync();

    await using var cmd = cn.CreateCommand();
    cmd.CommandText = "dbo.usp_Cart_AddOrMergeItem";
    cmd.CommandType = CommandType.StoredProcedure;
    cmd.Parameters.Add(new SqlParameter("@UserId", userId));
    cmd.Parameters.Add(new SqlParameter("@ProductId", req.ProductId));
    cmd.Parameters.Add(new SqlParameter("@Qty", req.Qty));
    cmd.Parameters.Add(new SqlParameter("@UnitPrice", req.UnitPrice));
    cmd.Parameters.Add(new SqlParameter("@Name", (object?)req.Name ?? DBNull.Value));

    int cartId = 0;
    await using (var rd = await cmd.ExecuteReaderAsync())
    {
        if (rd.HasRows && await rd.ReadAsync())
            cartId = rd.GetInt32(rd.GetOrdinal("CartId"));
    }

    return Results.Created($"/orders/cart", new { cartId });
});

// PUT /orders/cart/items/{itemId}  -> dbo.usp_Cart_UpdateQty
cart.MapPut("/items/{itemId:int}", async (HttpContext http, OrderDbContext db, int itemId, UpdateQtyReq req) =>
{
    var userId = GetUserId(http);

    await using var cn = db.Database.GetDbConnection();
    await cn.OpenAsync();

    await using var cmd = cn.CreateCommand();
    cmd.CommandText = "dbo.usp_Cart_UpdateQty";
    cmd.CommandType = CommandType.StoredProcedure;
    cmd.Parameters.Add(new SqlParameter("@UserId", userId));
    cmd.Parameters.Add(new SqlParameter("@ItemId", itemId));
    cmd.Parameters.Add(new SqlParameter("@Qty", req.Qty));

    await cmd.ExecuteNonQueryAsync();
    return Results.NoContent();
});

// DELETE /orders/cart/items/{itemId}  -> dbo.usp_Cart_RemoveItem
cart.MapDelete("/items/{itemId:int}", async (HttpContext http, OrderDbContext db, int itemId) =>
{
    var userId = GetUserId(http);

    await using var cn = db.Database.GetDbConnection();
    await cn.OpenAsync();

    await using var cmd = cn.CreateCommand();
    cmd.CommandText = "dbo.usp_Cart_RemoveItem";
    cmd.CommandType = CommandType.StoredProcedure;
    cmd.Parameters.Add(new SqlParameter("@UserId", userId));
    cmd.Parameters.Add(new SqlParameter("@ItemId", itemId));

    // Intento de filas afectadas (si el SP llena @Rows). Si tu SP no lo hace → quedará null y devolvemos 204.
    var rowsParam = new SqlParameter("@Rows", SqlDbType.Int) { Direction = ParameterDirection.Output };
    cmd.Parameters.Add(rowsParam);

    await cmd.ExecuteNonQueryAsync();

    if (rowsParam.Value is int rows)
        return rows > 0 ? Results.NoContent() : Results.NotFound();

    // Fallback si el SP tiene SET NOCOUNT ON y no expone @Rows
    return Results.NoContent();
});

// DELETE /orders/cart  -> dbo.usp_Cart_Clear
cart.MapDelete("/", async (HttpContext http, OrderDbContext db) =>
{
    var userId = GetUserId(http);

    await using var cn = db.Database.GetDbConnection();
    await cn.OpenAsync();

    await using var cmd = cn.CreateCommand();
    cmd.CommandText = "dbo.usp_Cart_Clear";
    cmd.CommandType = CommandType.StoredProcedure;
    cmd.Parameters.Add(new SqlParameter("@UserId", userId));

    await cmd.ExecuteNonQueryAsync();
    return Results.NoContent();
});

// ================== CHECKOUT (desde carrito) ==================
// POST /orders/checkout-from-cart -> dbo.usp_Order_Checkout (TVP)
app.MapPost("/orders/checkout-from-cart", async (HttpContext http, OrderDbContext db) =>
{
    var userId = GetUserId(http);

    await using var cn = db.Database.GetDbConnection();
    await cn.OpenAsync();

    int? cartId = null;
    var items = new List<(int ProductId, int Qty)>();

    // Reutiliza usp_Cart_Get
    await using (var getCmd = cn.CreateCommand())
    {
        getCmd.CommandText = "dbo.usp_Cart_Get";
        getCmd.CommandType = CommandType.StoredProcedure;
        getCmd.Parameters.Add(new SqlParameter("@UserId", userId));

        await using (var rd = await getCmd.ExecuteReaderAsync())
        {
            if (rd.HasRows && await rd.ReadAsync())
                cartId = rd.IsDBNull(rd.GetOrdinal("Id")) ? (int?)null : rd.GetInt32(rd.GetOrdinal("Id"));

            if (await rd.NextResultAsync())
            {
                while (await rd.ReadAsync())
                {
                    items.Add((
                        rd.GetInt32(rd.GetOrdinal("ProductId")),
                        rd.GetInt32(rd.GetOrdinal("Qty"))
                    ));
                }
            }
        }
    }

    if (cartId is null || items.Count == 0)
        return Results.BadRequest("Carrito vacío");

    var tvp = new DataTable();
    tvp.Columns.Add("ProductId", typeof(int));
    tvp.Columns.Add("Qty", typeof(int));
    foreach (var it in items) tvp.Rows.Add(it.ProductId, it.Qty);

    var result = new CheckoutResult();
    OrderHeader? header = null;
    var outItems = new List<OrderItemRow>();

    await using (var cmd = cn.CreateCommand())
    {
        cmd.CommandText = "dbo.usp_Order_Checkout";
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.Add(new SqlParameter("@UserId", userId));
        cmd.Parameters.Add(new SqlParameter("@Items", tvp)
        {
            SqlDbType = SqlDbType.Structured,
            TypeName = "dbo.TVP_OrderItem"
        });

        await using (var rd = await cmd.ExecuteReaderAsync())
        {
            if (rd.HasRows && await rd.ReadAsync())
            {
                result.Ok = rd.GetBoolean(rd.GetOrdinal("Ok"));
                result.OrderId = rd.IsDBNull(rd.GetOrdinal("OrderId")) ? null : rd.GetInt32(rd.GetOrdinal("OrderId"));
                result.Msg = rd.IsDBNull(rd.GetOrdinal("Msg")) ? "" : rd.GetString(rd.GetOrdinal("Msg"));
            }

            if (await rd.NextResultAsync() && rd.HasRows && await rd.ReadAsync())
            {
                header = new OrderHeader
                {
                    Id = rd.GetInt32(rd.GetOrdinal("Id")),
                    UserId = rd.GetInt32(rd.GetOrdinal("UserId")),
                    Total = rd.GetDecimal(rd.GetOrdinal("Total")),
                    Status = rd.GetString(rd.GetOrdinal("Status")),
                    CreatedAt = rd.GetDateTime(rd.GetOrdinal("CreatedAt"))
                };
            }

            if (await rd.NextResultAsync())
            {
                while (await rd.ReadAsync())
                {
                    outItems.Add(new OrderItemRow
                    {
                        ProductId = rd.GetInt32(rd.GetOrdinal("ProductId")),
                        Qty = rd.GetInt32(rd.GetOrdinal("Qty")),
                        UnitPrice = rd.GetDecimal(rd.GetOrdinal("UnitPrice"))
                    });
                }
            }
        }
    }

    if (!result.Ok) return Results.BadRequest(new { ok = false, message = result.Msg });
    if (header is null) return Results.Problem("SP no devolvió OrderHeader", statusCode: 500);

    // Marca carrito como CHECKED_OUT (si aplica a tu modelo)
    await using (var closeCmd = cn.CreateCommand())
    {
        closeCmd.CommandText = "UPDATE dbo.Carts SET Status='CHECKED_OUT' WHERE Id=@Id";
        closeCmd.CommandType = CommandType.Text;
        closeCmd.Parameters.Add(new SqlParameter("@Id", cartId));
        await closeCmd.ExecuteNonQueryAsync();
    }

    return Results.Ok(new
    {
        ok = true,
        order = new { header.Id, header.Total, header.Status, header.CreatedAt, items = outItems }
    });
}).RequireAuthorization();

// GET /orders/{orderId} -> dbo.usp_Order_Get
app.MapGet("/orders/{orderId:int}", async (HttpContext http, OrderDbContext db, int orderId) =>
{
    var userId = GetUserId(http);

    await using var cn = db.Database.GetDbConnection();
    await cn.OpenAsync();

    await using var cmd = cn.CreateCommand();
    cmd.CommandText = "dbo.usp_Order_Get";
    cmd.CommandType = CommandType.StoredProcedure;
    cmd.Parameters.Add(new SqlParameter("@OrderId", orderId));

    OrderHeader? header = null;
    var items = new List<OrderItemRow>();

    await using (var rd = await cmd.ExecuteReaderAsync())
    {
        if (rd.HasRows && await rd.ReadAsync())
        {
            header = new OrderHeader
            {
                Id = rd.GetInt32(rd.GetOrdinal("Id")),
                UserId = rd.GetInt32(rd.GetOrdinal("UserId")),
                Total = rd.GetDecimal(rd.GetOrdinal("Total")),
                Status = rd.GetString(rd.GetOrdinal("Status")),
                CreatedAt = rd.GetDateTime(rd.GetOrdinal("CreatedAt"))
            };
        }

        if (await rd.NextResultAsync())
        {
            while (await rd.ReadAsync())
            {
                items.Add(new OrderItemRow
                {
                    ProductId = rd.GetInt32(rd.GetOrdinal("ProductId")),
                    Qty = rd.GetInt32(rd.GetOrdinal("Qty")),
                    UnitPrice = rd.GetDecimal(rd.GetOrdinal("UnitPrice"))
                });
            }
        }
    }

    if (header is null) return Results.NotFound();
    if (header.UserId != userId) return Results.Unauthorized();

    return Results.Ok(new
    {
        header.Id,
        header.Total,
        header.Status,
        header.CreatedAt,
        items
    });
}).RequireAuthorization();

app.Run("http://localhost:5003");
