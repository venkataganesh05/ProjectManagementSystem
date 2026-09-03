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

// 1. Add DbContext with SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection string is not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    });
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

var app = builder.Build();

// 7. Global Exception Handling Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Enable CORS at the very beginning of the pipeline
app.UseCors("AllowFrontend");

// In development, do not force HTTPS redirection so HTTP frontend calls work smoothly without certificate errors
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// 8. Swagger in Development and Staging
if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Project & Task Management API v1");
        c.RoutePrefix = "swagger";
    });
}

// Redirect bare root "/" to Swagger UI via middleware — not registered as an endpoint so it won't appear in Swagger docs
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/")
    {
        context.Response.Redirect("/swagger");
        return;
    }
    await next();
});

app.UseAuthorization();

app.MapControllers();

// 9. Auto-migrate and Seed Database on startup
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedData.InitializeAsync(app.Services);
    app.Logger.LogInformation("Database migrated and seeded successfully.");
    app.Logger.LogInformation("==================================================================");
    app.Logger.LogInformation( "FRONTEND WEB UI:   http://localhost:5173");
    app.Logger.LogInformation("SWAGGER API DOCS:  http://localhost:5184/swagger");
    app.Logger.LogInformation("==================================================================");
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "An error occurred while migrating or seeding the database.");
}

app.Run();
