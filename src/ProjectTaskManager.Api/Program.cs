using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ProjectTaskManager.Application.Common.Interfaces;
using ProjectTaskManager.Data;
using ProjectTaskManager.Middleware;
using ProjectTaskManager.Services;
using ProjectTaskManager.Validators;

var builder = WebApplication.CreateBuilder(args);

// 1. Add DbContext (Supports both SQL Server and PostgreSQL)
var (dbProvider, effectiveConnectionString) = ResolveDatabaseConfig(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (dbProvider == "PostgreSQL")
    {
        options.UseNpgsql(effectiveConnectionString, npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorCodesToAdd: null);
        });
    }
    else
    {
        options.UseSqlServer(effectiveConnectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
    }
});
builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

// 2. Register Application Services
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();

// 3. Register FluentValidation Validators
builder.Services.AddValidatorsFromAssemblyContaining<CreateProjectValidator>();

// 4. Configure Controllers & JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// 5. Configure CORS
var allowedOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 6. Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Project & Task Management API",
        Version = "v1",
        Description = "RESTful API for managing engineering projects and work item tasks.<br/><br/>" +
                      "🚀 <strong>Frontend Web Application UI:</strong> <a href='http://localhost:5173' target='_blank' style='font-size: 15px; font-weight: bold; color: #2563eb; text-decoration: underline;'>http://localhost:5173</a>"
    });
});

// Respect PORT environment variable if running on Railway, Render, or Docker
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

var app = builder.Build();

// 7. Global Exception Handling Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Enable CORS
app.UseCors("AllowFrontend");

// Only redirect HTTPS if not in development and not behind a container proxy
if (!app.Environment.IsDevelopment() && string.IsNullOrEmpty(port))
{
    app.UseHttpsRedirection();
}

// 8. Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Project & Task Management API v1");
    c.RoutePrefix = "swagger";
});

// Serve frontend static files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// SPA fallback: serve index.html if present, else redirect to Swagger
app.MapFallback(async context =>
{
    var webRoot = app.Environment.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
    var indexPath = Path.Combine(webRoot, "index.html");
    if (File.Exists(indexPath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(indexPath);
    }
    else
    {
        context.Response.Redirect("/swagger");
    }
});

// 9. Auto-migrate and Seed Database on startup
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedData.InitializeAsync(app.Services);
    app.Logger.LogInformation("Database migrated and seeded successfully.");
    app.Logger.LogInformation("==================================================================");
    app.Logger.LogInformation($"DATABASE PROVIDER: {dbProvider}");
    app.Logger.LogInformation("FRONTEND WEB UI:   http://localhost:5173");
    app.Logger.LogInformation("SWAGGER API DOCS:  http://localhost:5184/swagger");
    app.Logger.LogInformation("==================================================================");
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "An error occurred while migrating or seeding the database.");
}

app.Run();

// Helper to determine whether to use PostgreSQL or SQL Server based on configuration / environment
static (string Provider, string ConnectionString) ResolveDatabaseConfig(IConfiguration configuration)
{
    // 1. Check Railway / Cloud standard DATABASE_URL or DATABASE_PUBLIC_URL environment variable
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
                   ?? Environment.GetEnvironmentVariable("DATABASE_PUBLIC_URL");

    if (!string.IsNullOrWhiteSpace(databaseUrl))
    {
        return ("PostgreSQL", ConvertPostgresUrlToConnectionString(databaseUrl));
    }

    // 2. Check ConnectionStrings:DefaultConnection
    var defaultConn = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;

    if (defaultConn.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        defaultConn.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return ("PostgreSQL", ConvertPostgresUrlToConnectionString(defaultConn));
    }

    if (defaultConn.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
        defaultConn.Contains("Port=5432", StringComparison.OrdinalIgnoreCase) ||
        defaultConn.Contains("Username=", StringComparison.OrdinalIgnoreCase))
    {
        return ("PostgreSQL", defaultConn);
    }

    // Default to SQL Server
    return ("SqlServer", defaultConn);
}

static string ConvertPostgresUrlToConnectionString(string url)
{
    try
    {
        var uri = new Uri(url);
        var userInfo = uri.UserInfo.Split(':');
        var user = userInfo[0];
        var pass = userInfo.Length > 1 ? userInfo[1] : string.Empty;
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');

        return $"Host={host};Port={port};Database={database};Username={user};Password={pass};SSL Mode=Prefer;Trust Server Certificate=true";
    }
    catch
    {
        return url;
    }
}
