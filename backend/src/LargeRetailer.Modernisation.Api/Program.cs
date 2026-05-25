using LargeRetailer.Modernisation.Application.Features;
using LargeRetailer.Modernisation.Application.Readiness;
using LargeRetailer.Modernisation.Application.Workstreams;
using LargeRetailer.Modernisation.Application.WorkflowReviews;
using LargeRetailer.Modernisation.Infrastructure;
using LargeRetailer.Modernisation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<IFeatureSliceQueryService, FeatureSliceQueryService>();
builder.Services.AddScoped<IProgramReadinessQueryService, ProgramReadinessQueryService>();
builder.Services.AddScoped<IWorkstreamQueryService, WorkstreamQueryService>();
builder.Services.AddScoped<IWorkflowReviewService, WorkflowReviewService>();
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

app.MapGet("/health/live", () => Results.Ok(new HealthResponse("Healthy", "LargeRetailer.Modernisation.Api")))
    .WithName("Liveness");

app.MapGet("/health/ready", async (
        ModernisationDbContext dbContext,
        CancellationToken cancellationToken) =>
    {
        var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);

        return canConnect
            ? Results.Ok(new HealthResponse("Ready", "LargeRetailer.Modernisation.Api"))
            : Results.Problem("Modernisation database is not reachable.", statusCode: StatusCodes.Status503ServiceUnavailable);
    })
    .WithName("Readiness");

app.MapGet("/api/operations/status", async (
        ModernisationDbContext dbContext,
        IWebHostEnvironment environment,
        CancellationToken cancellationToken) =>
    {
        var counts = new OperationalDatasetCounts(
            await dbContext.Workstreams.CountAsync(cancellationToken),
            await dbContext.Initiatives.CountAsync(cancellationToken),
            await dbContext.MigrationReadinessItems.CountAsync(cancellationToken),
            await dbContext.WarehouseSignals.CountAsync(cancellationToken),
            await dbContext.HrPlatformTasks.CountAsync(cancellationToken),
            await dbContext.InsightMetrics.CountAsync(cancellationToken),
            await dbContext.AutomationCandidates.CountAsync(cancellationToken));

        var response = new OperationalStatusResponse(
            "LargeRetailer.Modernisation.Api",
            "Ready",
            environment.EnvironmentName,
            DateTimeOffset.UtcNow,
            new OperationalDatabaseStatus("SQLite", "Reachable"),
            counts);

        return Results.Ok(response);
    })
    .WithName("GetOperationalStatus");

app.MapGet("/api/program/readiness", async (
        IProgramReadinessQueryService programReadinessQueryService,
        CancellationToken cancellationToken) =>
    Results.Ok(await programReadinessQueryService.GetAsync(cancellationToken)))
    .WithName("GetProgramReadiness");

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

app.MapGet("/api/workflow-reviews/{slice}/{recordId:int}", async (
        string slice,
        int recordId,
        IWorkflowReviewService workflowReviewService,
        CancellationToken cancellationToken) =>
    {
        var review = await workflowReviewService.GetLatestAsync(slice, recordId, cancellationToken);

        return review is null ? Results.NotFound() : Results.Ok(review);
    })
    .WithName("GetLatestWorkflowReview");

app.MapPost("/api/workflow-reviews/{slice}/{recordId:int}", async (
        string slice,
        int recordId,
        WorkflowReviewRequest request,
        IWorkflowReviewService workflowReviewService,
        CancellationToken cancellationToken) =>
    {
        var result = await workflowReviewService.CreateAsync(slice, recordId, request, cancellationToken);

        return result.IsValid
            ? Results.Created($"/api/workflow-reviews/{slice}/{recordId}", result.Review)
            : Results.ValidationProblem(result.Errors);
    })
    .WithName("CreateWorkflowReview");

app.Run();

public sealed record HealthResponse(string Status, string Service);

public sealed record OperationalStatusResponse(
    string Service,
    string Status,
    string Environment,
    DateTimeOffset GeneratedAtUtc,
    OperationalDatabaseStatus Database,
    OperationalDatasetCounts Counts);

public sealed record OperationalDatabaseStatus(string Provider, string Status);

public sealed record OperationalDatasetCounts(
    int Workstreams,
    int Initiatives,
    int PaymentReadinessItems,
    int WarehouseSignals,
    int HrPlatformTasks,
    int InsightMetrics,
    int AutomationCandidates);

public partial class Program;
