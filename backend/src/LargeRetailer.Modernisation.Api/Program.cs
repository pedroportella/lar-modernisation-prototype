using LargeRetailer.Modernisation.Application.Workstreams;
using LargeRetailer.Modernisation.Infrastructure;
using LargeRetailer.Modernisation.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<IWorkstreamQueryService, WorkstreamQueryService>();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularDev", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:4200",
                "http://localhost:4300",
                "http://127.0.0.1:4200",
                "http://127.0.0.1:4300")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AngularDev");

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ModernisationDbContext>();
    await ModernisationSeedData.EnsureSeededAsync(dbContext);
}

app.MapGet("/health", () => Results.Ok(new HealthResponse("Healthy", "LargeRetailer.Modernisation.Api")))
    .WithName("Health");

app.MapGet("/api/workstreams", async (
        IWorkstreamQueryService workstreamQueryService,
        CancellationToken cancellationToken) =>
    {
        var workstreams = await workstreamQueryService.ListAsync(cancellationToken);

        return Results.Ok(workstreams);
    })
    .WithName("GetWorkstreams");

app.MapGet("/api/workstreams/{id}", async (
        string id,
        IWorkstreamQueryService workstreamQueryService,
        CancellationToken cancellationToken) =>
    {
        var workstream = await workstreamQueryService.GetByIdAsync(id, cancellationToken);

        return workstream is null ? Results.NotFound() : Results.Ok(workstream);
    })
    .WithName("GetWorkstreamById");

app.Run();

public sealed record HealthResponse(string Status, string Service);

public partial class Program;
