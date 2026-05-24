using LargeRetailer.Modernisation.Application.Workstreams;
using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Tests;

public sealed class WorkstreamQueryServiceTests
{
    [Fact]
    public async Task ListAsync_returns_workstreams_in_priority_order()
    {
        var service = new WorkstreamQueryService(new StubWorkstreamRepository(
        [
            new Workstream
            {
                Id = "warehouse",
                Name = "Warehouse optimisation",
                Status = TransformationStatus.Monitoring,
                Summary = "Warehouse signal tracking.",
                Priority = 2
            },
            new Workstream
            {
                Id = "payments",
                Name = "Payment migration",
                Status = TransformationStatus.AtRisk,
                Summary = "Provider migration readiness.",
                Priority = 1
            }
        ]));

        var workstreams = await service.ListAsync(CancellationToken.None);

        Assert.Collection(
            workstreams,
            first => Assert.Equal("payments", first.Id),
            second => Assert.Equal("warehouse", second.Id));
    }

    private sealed class StubWorkstreamRepository(IReadOnlyCollection<Workstream> workstreams) : IWorkstreamRepository
    {
        public Task<IReadOnlyCollection<Workstream>> ListAsync(CancellationToken cancellationToken) =>
            Task.FromResult(workstreams);

        public Task<Workstream?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
            Task.FromResult(workstreams.FirstOrDefault(workstream => workstream.Id == id));
    }
}
