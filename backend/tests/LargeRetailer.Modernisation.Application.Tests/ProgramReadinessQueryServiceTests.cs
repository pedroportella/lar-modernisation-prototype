using LargeRetailer.Modernisation.Application.Readiness;
using LargeRetailer.Modernisation.Application.Workstreams;
using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Tests;

public sealed class ProgramReadinessQueryServiceTests
{
    [Fact]
    public async Task GetAsync_scores_attention_workstreams_and_prioritises_next_actions()
    {
        var service = new ProgramReadinessQueryService(new StubWorkstreamRepository(
        [
            new Workstream
            {
                Id = "payments",
                Name = "Payment migration",
                Status = TransformationStatus.AtRisk,
                Summary = "Provider readiness.",
                Priority = 1,
                Initiatives =
                [
                    new Initiative
                    {
                        Id = 2,
                        Name = "Cutover readiness review",
                        Status = TransformationStatus.AtRisk,
                        Owner = "Release lead",
                        NextAction = "Separate PCI review from local prototype assumptions."
                    }
                ]
            },
            new Workstream
            {
                Id = "warehouse",
                Name = "Warehouse optimisation",
                Status = TransformationStatus.Monitoring,
                Summary = "Signal tracking.",
                Priority = 2,
                Initiatives =
                [
                    new Initiative
                    {
                        Id = 3,
                        Name = "Operational signal baseline",
                        Status = TransformationStatus.Monitoring,
                        Owner = "Warehouse systems",
                        NextAction = "Validate seed metrics against the planned WMS gateway."
                    }
                ]
            },
            new Workstream
            {
                Id = "insights",
                Name = "Wayfinding insights",
                Status = TransformationStatus.OnTrack,
                Summary = "Decision support.",
                Priority = 3
            }
        ]));

        var readiness = await service.GetAsync(CancellationToken.None);

        Assert.Equal("AtRisk", readiness.OverallStatus);
        Assert.Equal(74, readiness.ReadinessScore);
        Assert.Contains("2 of 3", readiness.Summary);
        Assert.Contains(readiness.Signals, signal => signal.Label == "Needs attention" && signal.Value == 2);
        Assert.Collection(
            readiness.RecommendedActions,
            first => Assert.Equal("payments", first.WorkstreamId),
            second => Assert.Equal("warehouse", second.WorkstreamId));
    }

    private sealed class StubWorkstreamRepository(IReadOnlyCollection<Workstream> workstreams) : IWorkstreamRepository
    {
        public Task<IReadOnlyCollection<Workstream>> ListAsync(CancellationToken cancellationToken) =>
            Task.FromResult(workstreams);

        public Task<Workstream?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
            Task.FromResult(workstreams.FirstOrDefault(workstream => workstream.Id == id));
    }
}
