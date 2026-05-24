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

    private sealed record WorkstreamResponse(
        string Id,
        string Name,
        string Status,
        string Summary,
        int Priority);
}
