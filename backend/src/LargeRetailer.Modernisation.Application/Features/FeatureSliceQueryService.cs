using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Features;

public sealed class FeatureSliceQueryService(IFeatureSliceRepository repository) : IFeatureSliceQueryService
{
    public async Task<IReadOnlyCollection<PaymentReadinessItemDto>> ListPaymentReadinessAsync(CancellationToken cancellationToken)
    {
        var items = await repository.ListPaymentReadinessAsync(cancellationToken);

        return items.Select(ToDto).ToArray();
    }

    public async Task<IReadOnlyCollection<WarehouseSignalDto>> ListWarehouseSignalsAsync(CancellationToken cancellationToken)
    {
        var signals = await repository.ListWarehouseSignalsAsync(cancellationToken);

        return signals.Select(ToDto).ToArray();
    }

    public async Task<IReadOnlyCollection<HrPlatformTaskDto>> ListHrPlatformTasksAsync(CancellationToken cancellationToken)
    {
        var tasks = await repository.ListHrPlatformTasksAsync(cancellationToken);

        return tasks.Select(ToDto).ToArray();
    }

    public async Task<IReadOnlyCollection<InsightMetricDto>> ListInsightMetricsAsync(CancellationToken cancellationToken)
    {
        var metrics = await repository.ListInsightMetricsAsync(cancellationToken);

        return metrics.Select(ToDto).ToArray();
    }

    public async Task<IReadOnlyCollection<AutomationCandidateDto>> ListAutomationCandidatesAsync(CancellationToken cancellationToken)
    {
        var candidates = await repository.ListAutomationCandidatesAsync(cancellationToken);

        return candidates.Select(ToDto).ToArray();
    }

    private static PaymentReadinessItemDto ToDto(MigrationReadinessItem item) =>
        new(item.Id, item.Area, item.Status.ToString(), item.Risk, item.Owner, item.NextAction);

    private static WarehouseSignalDto ToDto(WarehouseSignal signal) =>
        new(signal.Id, signal.SignalName, signal.CurrentValue, signal.Unit, signal.Status.ToString(), signal.Opportunity);

    private static HrPlatformTaskDto ToDto(HrPlatformTask task) =>
        new(task.Id, task.TaskName, task.Status.ToString(), task.ProcessRisk, task.Owner);

    private static InsightMetricDto ToDto(InsightMetric metric) =>
        new(metric.Id, metric.MetricName, metric.Value, metric.Unit, metric.Status.ToString());

    private static AutomationCandidateDto ToDto(AutomationCandidate candidate) =>
        new(
            candidate.Id,
            candidate.WorkflowName,
            candidate.ValueScore,
            candidate.EffortScore,
            candidate.RiskClass,
            candidate.RecommendedNextStep);
}
