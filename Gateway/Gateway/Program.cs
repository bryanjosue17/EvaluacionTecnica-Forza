using Microsoft.AspNetCore.Mvc;   // ? para [FromServices]
using Yarp.ReverseProxy;

var builder = WebApplication.CreateBuilder(args);

// CORS (opcional)
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true)));

// YARP desde appsettings.json
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Necesario para el endpoint /health
builder.Services.AddHttpClient();

var app = builder.Build();

app.UseCors();

// Ping del gateway
app.MapGet("/ping", () =>
    Results.Ok(new { service = "Gateway", status = "ok", utc = DateTime.UtcNow }))
   .AllowAnonymous();

// Health opcional de los microservicios (nota el [FromServices])
app.MapGet("/health", async ([FromServices] IHttpClientFactory hf) =>
{
    var hc = hf.CreateClient();
    var urls = new[]
    {
        "http://localhost:5001/auth/ping",
        "http://localhost:5002/catalog/products",
        "http://localhost:5003/orders/ping"
    };

    var checks = new List<object>();
    foreach (var u in urls)
    {
        try
        {
            var r = await hc.GetAsync(u);
            checks.Add(new { url = u, ok = r.IsSuccessStatusCode });
        }
        catch
        {
            checks.Add(new { url = u, ok = false });
        }
    }
    return Results.Ok(checks);
}).AllowAnonymous();

// Reverse proxy
app.MapReverseProxy();

app.Run("http://localhost:8080");
