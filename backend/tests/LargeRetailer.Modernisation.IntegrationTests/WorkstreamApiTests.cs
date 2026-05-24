using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace LargeRetailer.Modernisation.IntegrationTests;

public sealed class WorkstreamApiTests
{
    [Fact]
    public async Task Workstreams_endpoint_returns_seeded_data()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"lar-modernisation-{Guid.NewGuid():N}.db");

        await using var application = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, configurationBuilder) =>
                {
                    configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:ModernisationDb"] = $"Data Source={databasePath}"
                    });
                });
            });

        var client = application.CreateClient();

        var workstreams = await client.GetFromJsonAsync<WorkstreamResponse[]>(
            "/api/workstreams",
            CancellationToken.None);

        Assert.NotNull(workstreams);
        Assert.Equal(5, workstreams.Length);
        Assert.Contains(workstreams, workstream => workstream.Id == "payments" && workstream.Status == "AtRisk");
    }

    [Fact]
    public async Task Unknown_workstream_returns_not_found()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"lar-modernisation-{Guid.NewGuid():N}.db");

        await using var application = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, configurationBuilder) =>
                {
                    configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:ModernisationDb"] = $"Data Source={databasePath}"
                    });
                });
            });

        var client = application.CreateClient();

        var response = await client.GetAsync("/api/workstreams/not-real", CancellationToken.None);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Operations_status_endpoint_returns_readiness_and_dataset_counts()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"lar-modernisation-{Guid.NewGuid():N}.db");

        await using var application = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, configurationBuilder) =>
                {
                    configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:ModernisationDb"] = $"Data Source={databasePath}"
                    });
                });
            });

        var client = application.CreateClient();

        var status = await client.GetFromJsonAsync<OperationalStatusResponse>(
            "/api/operations/status",
            CancellationToken.None);

        Assert.NotNull(status);
        Assert.Equal("Ready", status.Status);
        Assert.Equal("SQLite", status.Database.Provider);
        Assert.Equal("Reachable", status.Database.Status);
        Assert.Equal(5, status.Counts.Workstreams);
        Assert.Equal(6, status.Counts.Initiatives);
        Assert.Equal(2, status.Counts.PaymentReadinessItems);
        Assert.Equal(1, status.Counts.AutomationCandidates);
    }

    [Fact]
    public async Task Program_readiness_endpoint_returns_derived_delivery_posture()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"lar-modernisation-{Guid.NewGuid():N}.db");

        await using var application = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, configurationBuilder) =>
                {
                    configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:ModernisationDb"] = $"Data Source={databasePath}"
                    });
                });
            });

        var client = application.CreateClient();

        var readiness = await client.GetFromJsonAsync<ProgramReadinessResponse>(
            "/api/program/readiness",
            CancellationToken.None);

        Assert.NotNull(readiness);
        Assert.Equal("AtRisk", readiness.OverallStatus);
        Assert.Equal(66, readiness.ReadinessScore);
        Assert.Contains(readiness.Signals, signal => signal.Label == "Needs attention" && signal.Value == 3);
        Assert.Contains(readiness.RecommendedActions, action => action.WorkstreamId == "payments");
    }

    [Theory]
    [InlineData("/api/payments/migration-readiness", 2)]
    [InlineData("/api/warehouse/optimisation", 1)]
    [InlineData("/api/hr/platform-uplift", 1)]
    [InlineData("/api/insights/wayfinding", 1)]
    [InlineData("/api/automation/candidates", 1)]
    public async Task Feature_slice_endpoints_return_seeded_data(string endpoint, int expectedCount)
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"lar-modernisation-{Guid.NewGuid():N}.db");

        await using var application = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, configurationBuilder) =>
                {
                    configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:ModernisationDb"] = $"Data Source={databasePath}"
                    });
                });
            });

        var client = application.CreateClient();

        var records = await client.GetFromJsonAsync<object[]>(endpoint, CancellationToken.None);

        Assert.NotNull(records);
        Assert.Equal(expectedCount, records.Length);
    }

    private sealed record WorkstreamResponse(
        string Id,
        string Name,
        string Status,
        string Summary,
        int Priority);

    private sealed record OperationalStatusResponse(
        string Service,
        string Status,
        string Environment,
        DateTimeOffset GeneratedAtUtc,
        OperationalDatabaseStatus Database,
        OperationalDatasetCounts Counts);

    private sealed record OperationalDatabaseStatus(string Provider, string Status);

    private sealed record OperationalDatasetCounts(
        int Workstreams,
        int Initiatives,
        int PaymentReadinessItems,
        int WarehouseSignals,
        int HrPlatformTasks,
        int InsightMetrics,
        int AutomationCandidates);

    private sealed record ProgramReadinessResponse(
        string OverallStatus,
        int ReadinessScore,
        string Summary,
        IReadOnlyCollection<ReadinessSignalResponse> Signals,
        IReadOnlyCollection<RecommendedActionResponse> RecommendedActions);

    private sealed record ReadinessSignalResponse(string Label, int Value, string Status);

    private sealed record RecommendedActionResponse(
        string WorkstreamId,
        string WorkstreamName,
        string Initiative,
        string Owner,
        string Status,
        string NextAction);
}
