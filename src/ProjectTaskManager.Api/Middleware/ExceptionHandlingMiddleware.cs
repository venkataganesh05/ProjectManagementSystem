using System.Net;
using System.Text.Json;
using ProjectTaskManager.Common;

namespace ProjectTaskManager.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request execution.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message, errors) = exception switch
        {
            KeyNotFoundException notFound => (
                (int)HttpStatusCode.NotFound,
                notFound.Message,
                new List<string> { notFound.Message }
            ),
            ArgumentException argEx => (
                (int)HttpStatusCode.BadRequest,
                argEx.Message,
                new List<string> { argEx.Message }
            ),
            FluentValidation.ValidationException validationEx => (
                (int)HttpStatusCode.BadRequest,
                "One or more validation errors occurred.",
                validationEx.Errors.Select(e => e.ErrorMessage).ToList()
            ),
            _ => (
                (int)HttpStatusCode.InternalServerError,
                "An unexpected server error occurred. Please try again later.",
                new List<string> { exception.Message }
            )
        };

        context.Response.StatusCode = statusCode;

        var response = ApiResponse<object>.Fail(message, errors, statusCode);
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}
