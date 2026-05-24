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
}
