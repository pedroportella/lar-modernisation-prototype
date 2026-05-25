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

    [Fact]
    public async Task Workflow_review_endpoint_persists_and_returns_latest_review()
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
        var recordId = Random.Shared.Next(1_000_000, int.MaxValue);

        var emptyResponse = await client.GetAsync(
            $"/api/workflow-reviews/payments/{recordId}",
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.NotFound, emptyResponse.StatusCode);

        var saveResponse = await PostWorkflowReviewAsync(
            client,
            $"/api/workflow-reviews/payments/{recordId}",
            new WorkflowReviewRequest(
                "Blocked",
                "Escalate cutover dependency",
                "Reviewed with release lead and dependency owner.",
                "Delivery lead"),
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.Created, saveResponse.StatusCode);

        var review = await client.GetFromJsonAsync<WorkflowReviewResponse>(
            $"/api/workflow-reviews/payments/{recordId}",
            CancellationToken.None);

        Assert.NotNull(review);
        Assert.Equal("payments", review.Slice);
        Assert.Equal(recordId, review.RecordId);
        Assert.Equal("Blocked", review.Status);
        Assert.Equal("Escalate cutover dependency", review.Action);
    }

    [Fact]
    public async Task Workflow_review_endpoint_rejects_invalid_payload()
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

        var response = await PostWorkflowReviewAsync(
            client,
            "/api/workflow-reviews/unknown/1",
            new WorkflowReviewRequest("NotReal", "short", "tiny", ""),
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("Viewer")]
    [InlineData("NotARole")]
    public async Task Workflow_review_endpoint_requires_delivery_or_admin_role(string? role)
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

        var response = await PostWorkflowReviewAsync(
            client,
            "/api/workflow-reviews/payments/1",
            new WorkflowReviewRequest(
                "Blocked",
                "Escalate cutover dependency",
                "Reviewed with release lead and dependency owner.",
                "Delivery lead"),
            CancellationToken.None,
            role);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
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

    private sealed record WorkflowReviewRequest(
        string Status,
        string Action,
        string Note,
        string ReviewedBy);

    private sealed record WorkflowReviewResponse(
        int Id,
        string Slice,
        int RecordId,
        string Status,
        string Action,
        string Note,
        string ReviewedBy,
        DateTimeOffset ReviewedAtUtc);

    private static Task<HttpResponseMessage> PostWorkflowReviewAsync(
        HttpClient client,
        string endpoint,
        WorkflowReviewRequest request,
        CancellationToken cancellationToken,
        string? role = "DeliveryLead")
    {
        var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = JsonContent.Create(request)
        };

        if (!string.IsNullOrWhiteSpace(role))
        {
            httpRequest.Headers.Add("X-LAR-DEMO-ROLE", role);
        }

        return client.SendAsync(httpRequest, cancellationToken);
    }
}
