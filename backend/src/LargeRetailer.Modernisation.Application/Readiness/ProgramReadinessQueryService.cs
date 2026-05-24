using LargeRetailer.Modernisation.Application.Workstreams;
using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Readiness;

public sealed class ProgramReadinessQueryService(IWorkstreamRepository repository) : IProgramReadinessQueryService
{
    public async Task<ProgramReadinessDto> GetAsync(CancellationToken cancellationToken)
    {
        var workstreams = (await repository.ListAsync(cancellationToken))
            .OrderBy(workstream => workstream.Priority)
            .ToArray();

        var blockedCount = CountByStatus(workstreams, TransformationStatus.Blocked);
        var atRiskCount = CountByStatus(workstreams, TransformationStatus.AtRisk);
        var monitoringCount = CountByStatus(workstreams, TransformationStatus.Monitoring);
        var onTrackCount = CountByStatus(workstreams, TransformationStatus.OnTrack);
        var completeCount = CountByStatus(workstreams, TransformationStatus.Complete);
        var attentionCount = blockedCount + atRiskCount + monitoringCount;
        var readinessScore = Math.Clamp(100 - (blockedCount * 25) - (atRiskCount * 18) - (monitoringCount * 8), 0, 100);
        var overallStatus = DetermineOverallStatus(blockedCount, atRiskCount, monitoringCount);

        return new ProgramReadinessDto(
            overallStatus.ToString(),
            readinessScore,
            BuildSummary(workstreams.Length, attentionCount),
            [
                new ReadinessSignalDto("Total workstreams", workstreams.Length, "OnTrack"),
                new ReadinessSignalDto("Needs attention", attentionCount, attentionCount > 0 ? overallStatus.ToString() : "OnTrack"),
                new ReadinessSignalDto("On track", onTrackCount + completeCount, "OnTrack"),
                new ReadinessSignalDto("Monitoring", monitoringCount, monitoringCount > 0 ? "Monitoring" : "OnTrack")
            ],
            BuildRecommendedActions(workstreams));
    }

    private static int CountByStatus(IEnumerable<Workstream> workstreams, TransformationStatus status) =>
        workstreams.Count(workstream => workstream.Status == status);

    private static TransformationStatus DetermineOverallStatus(int blockedCount, int atRiskCount, int monitoringCount)
    {
        if (blockedCount > 0)
        {
            return TransformationStatus.Blocked;
        }

        if (atRiskCount > 0)
        {
            return TransformationStatus.AtRisk;
        }

        return monitoringCount > 0 ? TransformationStatus.Monitoring : TransformationStatus.OnTrack;
    }

    private static string BuildSummary(int totalWorkstreams, int attentionCount) =>
        attentionCount == 0
            ? $"All {totalWorkstreams} workstreams have a clear delivery posture."
            : $"{attentionCount} of {totalWorkstreams} workstreams need active delivery attention.";

    private static IReadOnlyCollection<RecommendedActionDto> BuildRecommendedActions(IReadOnlyCollection<Workstream> workstreams)
    {
        var actions = workstreams
            .SelectMany(workstream => workstream.Initiatives.Select(initiative => new { workstream, initiative }))
            .Where(item => item.initiative.Status is TransformationStatus.AtRisk or TransformationStatus.Blocked or TransformationStatus.Monitoring)
            .OrderBy(item => item.workstream.Priority)
            .ThenBy(item => item.initiative.Id)
            .Take(4)
            .Select(item => new RecommendedActionDto(
                item.workstream.Id,
                item.workstream.Name,
                item.initiative.Name,
                item.initiative.Owner,
                item.initiative.Status.ToString(),
                item.initiative.NextAction))
            .ToArray();

        return actions.Length > 0
            ? actions
            :
            [
                new RecommendedActionDto(
                    "program",
                    "Modernisation program",
                    "Delivery cadence",
                    "Program lead",
                    TransformationStatus.OnTrack.ToString(),
                    "Maintain weekly evidence review and keep integration assumptions explicit.")
            ];
    }
}
