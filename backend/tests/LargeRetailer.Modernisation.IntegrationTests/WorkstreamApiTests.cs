using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
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
        Assert.False(string.IsNullOrWhiteSpace(status.CorrelationId));
        Assert.Equal("X-Correlation-ID", status.Runtime.CorrelationHeader);
        Assert.Equal("SQLite", status.Runtime.DatabaseProvider);
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

        var records = await client.GetFromJsonAsync<PagedResponse<JsonElement>>(endpoint, CancellationToken.None);

        Assert.NotNull(records);
        Assert.Equal(expectedCount, records.TotalItems);
        Assert.Equal(expectedCount, records.Items.Count);
        Assert.Equal(1, records.Page);
        Assert.Equal(25, records.PageSize);
    }

    [Fact]
    public async Task Feature_slice_query_filters_and_pages_on_the_server()
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

        var filtered = await client.GetFromJsonAsync<PagedResponse<JsonElement>>(
            "/api/payments/migration-readiness?search=refund&page=1&pageSize=1&sort=-area",
            CancellationToken.None);

        Assert.NotNull(filtered);
        Assert.Single(filtered.Items);
        Assert.Equal(1, filtered.Page);
        Assert.Equal(1, filtered.PageSize);
        Assert.Equal(1, filtered.TotalItems);
        Assert.Equal("Refunds and disputes", filtered.Items.Single().GetProperty("area").GetString());
    }

    [Theory]
    [InlineData("/api/payments/migration-readiness?pageSize=500", "pageSize")]
    [InlineData("/api/payments/migration-readiness?page=0", "page")]
    [InlineData("/api/payments/migration-readiness?sort=unknown", "sort")]
    public async Task Feature_slice_query_rejects_invalid_contract_values(string endpoint, string expectedError)
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

        var response = await client.GetAsync(endpoint, CancellationToken.None);
        var problem = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(CancellationToken.None),
            cancellationToken: CancellationToken.None);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True(problem.RootElement.GetProperty("errors").TryGetProperty(expectedError, out _));
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
        var problem = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(CancellationToken.None),
            cancellationToken: CancellationToken.None);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True(problem.RootElement.TryGetProperty("correlationId", out _));
        Assert.True(problem.RootElement.TryGetProperty("errors", out _));
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

    [Fact]
    public async Task Api_returns_correlation_id_when_none_is_supplied()
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

        var response = await client.GetAsync("/api/operations/status", CancellationToken.None);

        Assert.True(response.Headers.TryGetValues("X-Correlation-ID", out var values));
        Assert.False(string.IsNullOrWhiteSpace(values.Single()));
    }

    [Fact]
    public async Task Api_preserves_supplied_correlation_id()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"lar-modernisation-{Guid.NewGuid():N}.db");
        var suppliedCorrelationId = $"review-{Guid.NewGuid():N}";

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
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/operations/status");
        request.Headers.Add("X-Correlation-ID", suppliedCorrelationId);

        var response = await client.SendAsync(request, CancellationToken.None);
        var status = await response.Content.ReadFromJsonAsync<OperationalStatusResponse>(CancellationToken.None);

        Assert.True(response.Headers.TryGetValues("X-Correlation-ID", out var values));
        Assert.Equal(suppliedCorrelationId, values.Single());
        Assert.NotNull(status);
        Assert.Equal(suppliedCorrelationId, status.CorrelationId);
    }

    [Fact]
    public async Task Problem_responses_include_correlation_id()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"lar-modernisation-{Guid.NewGuid():N}.db");
        const string suppliedCorrelationId = "denied-review-write";

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
        var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/workflow-reviews/payments/1")
        {
            Content = JsonContent.Create(new WorkflowReviewRequest(
                "Blocked",
                "Escalate cutover dependency",
                "Reviewed with release lead and dependency owner.",
                "Delivery lead"))
        };
        httpRequest.Headers.Add("X-Correlation-ID", suppliedCorrelationId);
        httpRequest.Headers.Add("X-LAR-DEMO-ROLE", "Viewer");

        var response = await client.SendAsync(httpRequest, CancellationToken.None);
        var problem = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(CancellationToken.None),
            cancellationToken: CancellationToken.None);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(
            suppliedCorrelationId,
            problem.RootElement.GetProperty("correlationId").GetString());
    }

    [Fact]
    public async Task Api_rate_limit_returns_correlated_problem_response()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"lar-modernisation-{Guid.NewGuid():N}.db");

        await using var application = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, configurationBuilder) =>
                {
                    configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:ModernisationDb"] = $"Data Source={databasePath}",
                        ["Security:RateLimiting:PermitLimit"] = "1",
                        ["Security:RateLimiting:WindowSeconds"] = "60"
                    });
                });
            });

        var client = application.CreateClient();
        const string suppliedCorrelationId = "limited-query";
        var firstRequest = new HttpRequestMessage(HttpMethod.Get, "/api/workstreams");
        firstRequest.Headers.Add("X-Correlation-ID", "first-query");
        var limitedRequest = new HttpRequestMessage(HttpMethod.Get, "/api/workstreams");
        limitedRequest.Headers.Add("X-Correlation-ID", suppliedCorrelationId);

        var firstResponse = await client.SendAsync(firstRequest, CancellationToken.None);
        var limitedResponse = await client.SendAsync(limitedRequest, CancellationToken.None);
        var problem = await JsonDocument.ParseAsync(
            await limitedResponse.Content.ReadAsStreamAsync(CancellationToken.None),
            cancellationToken: CancellationToken.None);

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal((HttpStatusCode)429, limitedResponse.StatusCode);
        Assert.Equal(
            suppliedCorrelationId,
            problem.RootElement.GetProperty("correlationId").GetString());
    }

    private sealed record WorkstreamResponse(
        string Id,
        string Name,
        string Status,
        string Summary,
        int Priority);

    private sealed record PagedResponse<T>(
        IReadOnlyCollection<T> Items,
        int Page,
        int PageSize,
        int TotalItems,
        int TotalPages);

    private sealed record OperationalStatusResponse(
        string Service,
        string Status,
        string Environment,
        DateTimeOffset GeneratedAtUtc,
        string CorrelationId,
        OperationalRuntimeStatus Runtime,
        OperationalDatabaseStatus Database,
        OperationalDatasetCounts Counts);

    private sealed record OperationalRuntimeStatus(
        string BuildName,
        string BuildVersion,
        string DatabaseProvider,
        string CorrelationHeader);

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
