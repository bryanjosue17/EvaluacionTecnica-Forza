using Microsoft.EntityFrameworkCore;

namespace AuthSvc.Models;

public class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }

    public DbSet<Models> Users => Set<Models>();

    // View/shape para login mediante SP
    public DbSet<UserLoginView> UserLoginView => Set<UserLoginView>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Models>(e =>
        {
            e.ToTable("Users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).HasMaxLength(256);
            e.Property(x => x.PasswordHash).HasMaxLength(200);
        });

        modelBuilder.Entity<UserLoginView>(e =>
        {
            e.HasNoKey(); // porque viene de un SP
            e.Property(x => x.Email).HasMaxLength(256);
            e.Property(x => x.PasswordHash).HasMaxLength(200);
        });

        base.OnModelCreating(modelBuilder);
    }
}

public class Models
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class UserLoginView
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
}
public record UserReq(string Email, string Password);
