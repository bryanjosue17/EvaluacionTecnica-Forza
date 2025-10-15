using AuthSvc.Models;
using BCrypt.Net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

// ---------- Config obligatoria ----------
var cs = cfg.GetConnectionString("Sql")
    ?? throw new InvalidOperationException("Falta ConnectionStrings:Sql");
var jwtIssuer = cfg["Jwt:Issuer"] ?? throw new InvalidOperationException("Falta Jwt:Issuer");
var jwtAudience = cfg["Jwt:Audience"] ?? throw new InvalidOperationException("Falta Jwt:Audience");
var jwtSecret = cfg["Jwt:Secret"] ?? throw new InvalidOperationException("Falta Jwt:Secret");

// ---------- Services ----------
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseSqlServer(cs, sql => sql.EnableRetryOnFailure())
);

builder.Services.AddAuthorization();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

// ---------- App ----------
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// POST /auth/register  -> EXEC dbo.usp_User_Create @Email, @PasswordHash
app.MapPost("/auth/register", async (AuthDbContext db, UserReq req) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
        return Results.BadRequest(new { message = "Email and password are required" });

    var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);

    await using var cn = db.Database.GetDbConnection();
    await cn.OpenAsync();

    await using var cmd = cn.CreateCommand();
    cmd.CommandText = "dbo.usp_User_Create";
    cmd.CommandType = System.Data.CommandType.StoredProcedure;
    cmd.Parameters.Add(new SqlParameter("@Email", req.Email));
    cmd.Parameters.Add(new SqlParameter("@PasswordHash", hash));

    bool ok = false;
    await using (var rd = await cmd.ExecuteReaderAsync())
    {
        if (await rd.ReadAsync())
            ok = rd.GetBoolean(rd.GetOrdinal("Ok")); // tu SP debe devolver columna Ok bit
    }

    return ok ? Results.StatusCode(201) : Results.Conflict(new { message = "Email already exists" });
});

// POST /auth/login  -> EXEC dbo.usp_User_GetByEmail @Email  (FIX non-composable)
app.MapPost("/auth/login", async (AuthDbContext db, UserReq req) =>
{
    var pEmail = new SqlParameter("@Email", req.Email);

    var rows = await db.UserLoginView
        .FromSqlRaw("EXEC dbo.usp_User_GetByEmail @Email", pEmail)
        .AsNoTracking()
        .ToListAsync();                // <-- materializa primero

    var row = rows.FirstOrDefault();   // <-- luego compones en memoria

    if (row is null || !BCrypt.Net.BCrypt.Verify(req.Password, row.PasswordHash))
        return Results.Unauthorized();

    var token = IssueJwt(row.Id.ToString(), row.Email, jwtIssuer, jwtAudience, jwtSecret);
    return Results.Ok(new { access_token = token });
});

// GET /auth/me (JWT)
app.MapGet("/auth/me", async (AuthDbContext db, HttpContext http) =>
{
    var sub = http.User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (sub is null) return Results.Unauthorized();

    var id = int.Parse(sub);
    var me = await db.Users.AsNoTracking()
        .Select(u => new { u.Id, u.Email, u.CreatedAt })
        .FirstOrDefaultAsync(u => u.Id == id);

    return me is null ? Results.NotFound() : Results.Ok(me);
}).RequireAuthorization();

app.MapGet("/auth/health", async (AuthDbContext db) =>
{
    try
    {
        await db.Database.ExecuteSqlRawAsync("SELECT 1");
        return Results.Ok(new { service = "AuthSvc", db = "up" });
    }
    catch (Exception ex)
    {
        return Results.Problem(title: "DB down", detail: ex.Message, statusCode: 503);
    }
}).AllowAnonymous();

app.Run("http://localhost:5001");

// ---------- Helpers ----------
static string IssueJwt(string userId, string email, string issuer, string audience, string secret)
{
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, userId),
        new Claim(ClaimTypes.Email, email)
    };

    var jwt = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: DateTime.UtcNow.AddHours(4),
        signingCredentials: creds
    );
    return new JwtSecurityTokenHandler().WriteToken(jwt);
}
