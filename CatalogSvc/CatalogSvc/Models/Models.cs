using Microsoft.EntityFrameworkCore;

namespace CatalogSvc.Models;

public class CatalogDbContext : DbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductListRow> ProductListRows => Set<ProductListRow>();
    public DbSet<ProductRow> ProductRows => Set<ProductRow>();
    public DbSet<IdRow> IdRows => Set<IdRow>();
    public DbSet<AffectedRow> AffectedRows => Set<AffectedRow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("Products");
            e.HasKey(x => x.Id);
            e.Property(x => x.Price).HasPrecision(10, 2);
        });

        modelBuilder.Entity<ProductListRow>(e =>
        {
            e.HasNoKey();
            e.Property(x => x.Price).HasPrecision(10, 2);
        });

        modelBuilder.Entity<ProductRow>(e =>
        {
            e.HasNoKey();
            e.Property(x => x.Price).HasPrecision(10, 2);
        });

        modelBuilder.Entity<IdRow>().HasNoKey();
        modelBuilder.Entity<AffectedRow>().HasNoKey();

        base.OnModelCreating(modelBuilder);
    }
}

// ======= Entidades =======
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ======= Resultados de SPs =======
public class ProductListRow
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Total { get; set; }
}

public class ProductRow
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class IdRow { public int Id { get; set; } }
public class AffectedRow { public int Affected { get; set; } }
