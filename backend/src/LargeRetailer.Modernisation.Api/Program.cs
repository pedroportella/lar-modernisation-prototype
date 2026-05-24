using LargeRetailer.Modernisation.Application.Features;
using LargeRetailer.Modernisation.Application.Workstreams;
using LargeRetailer.Modernisation.Infrastructure;
using LargeRetailer.Modernisation.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<IFeatureSliceQueryService, FeatureSliceQueryService>();
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

app.MapGet("/api/payments/migration-readiness", async (
        IFeatureSliceQueryService featureSliceQueryService,
        CancellationToken cancellationToken) =>
    Results.Ok(await featureSliceQueryService.ListPaymentReadinessAsync(cancellationToken)))
    .WithName("GetPaymentMigrationReadiness");

app.MapGet("/api/warehouse/optimisation", async (
        IFeatureSliceQueryService featureSliceQueryService,
        CancellationToken cancellationToken) =>
    Results.Ok(await featureSliceQueryService.ListWarehouseSignalsAsync(cancellationToken)))
    .WithName("GetWarehouseOptimisation");

app.MapGet("/api/hr/platform-uplift", async (
        IFeatureSliceQueryService featureSliceQueryService,
        CancellationToken cancellationToken) =>
    Results.Ok(await featureSliceQueryService.ListHrPlatformTasksAsync(cancellationToken)))
    .WithName("GetHrPlatformUplift");

app.MapGet("/api/insights/wayfinding", async (
        IFeatureSliceQueryService featureSliceQueryService,
        CancellationToken cancellationToken) =>
    Results.Ok(await featureSliceQueryService.ListInsightMetricsAsync(cancellationToken)))
    .WithName("GetWayfindingInsights");

app.MapGet("/api/automation/candidates", async (
        IFeatureSliceQueryService featureSliceQueryService,
        CancellationToken cancellationToken) =>
    Results.Ok(await featureSliceQueryService.ListAutomationCandidatesAsync(cancellationToken)))
    .WithName("GetAutomationCandidates");

app.Run();

public sealed record HealthResponse(string Status, string Service);

public partial class Program;
