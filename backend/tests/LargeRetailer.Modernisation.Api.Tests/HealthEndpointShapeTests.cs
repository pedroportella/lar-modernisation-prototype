namespace LargeRetailer.Modernisation.Api.Tests;

public sealed class HealthEndpointShapeTests
{
    [Fact]
    public void Health_endpoint_contract_is_stable_for_smoke_checks()
    {
        var response = new HealthResponse("Healthy", "LargeRetailer.Modernisation.Api");

        Assert.Equal("Healthy", response.Status);
        Assert.Equal("LargeRetailer.Modernisation.Api", response.Service);
    }

    [Fact]
    public void Operational_status_contract_exposes_runtime_and_dataset_counts()
    {
        var response = new OperationalStatusResponse(
            "LargeRetailer.Modernisation.Api",
            "Ready",
            "Development",
            DateTimeOffset.UnixEpoch,
            "test-correlation",
            new OperationalRuntimeStatus(
                "LargeRetailer.Modernisation.Api",
                "1.0.0.0",
                "SQLite",
                "X-Correlation-ID"),
            new OperationalDatabaseStatus("SQLite", "Reachable"),
            new OperationalDatasetCounts(5, 6, 2, 1, 1, 1, 1));

        Assert.Equal("Ready", response.Status);
        Assert.Equal("test-correlation", response.CorrelationId);
        Assert.Equal("X-Correlation-ID", response.Runtime.CorrelationHeader);
        Assert.Equal("SQLite", response.Database.Provider);
        Assert.Equal(5, response.Counts.Workstreams);
        Assert.Equal(6, response.Counts.Initiatives);
    }
}
