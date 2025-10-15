// File: OrderSvc/Data/OrderDbContext.cs
using Microsoft.EntityFrameworkCore;
using OrderSvc.Models;

namespace OrderSvc.Data
{
    public class OrderDbContext : DbContext
    {
        public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options) { }

        // Tablas del carrito (si decides usar EF en algún punto)
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();

        // Resultsets keyless de SPs (por si usas EF con FromSql en algún otro endpoint)
        public DbSet<CheckoutResult> CheckoutResults => Set<CheckoutResult>();
        public DbSet<OrderHeader> OrderHeaders => Set<OrderHeader>();
        public DbSet<OrderItemRow> OrderItemsRows => Set<OrderItemRow>();

        protected override void OnModelCreating(ModelBuilder mb)
        {
            // Carrito
            mb.Entity<Cart>(e =>
            {
                e.ToTable("Carts");
                e.HasKey(x => x.Id);
                e.Property(x => x.Status).HasMaxLength(20);
                e.Property(x => x.CreatedAt).HasPrecision(0);
                e.HasMany(x => x.Items)
                 .WithOne(i => i.Cart!)
                 .HasForeignKey(i => i.CartId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            mb.Entity<CartItem>(e =>
            {
                e.ToTable("CartItems");
                e.HasKey(x => x.Id);
                e.Property(x => x.Name).HasMaxLength(200).IsRequired();
                e.Property(x => x.UnitPrice).HasPrecision(10, 2);
                e.Property(x => x.Qty).IsRequired();
                e.HasIndex(x => new { x.CartId, x.ProductId }).IsUnique();
            });

            // SPs (keyless)
            mb.Entity<CheckoutResult>().HasNoKey();
            mb.Entity<OrderHeader>(e =>
            {
                e.HasNoKey();
                e.Property(p => p.Total).HasPrecision(10, 2);
            });
            mb.Entity<OrderItemRow>(e =>
            {
                e.HasNoKey();
                e.Property(p => p.UnitPrice).HasPrecision(10, 2);
            });
        }
    }
}
