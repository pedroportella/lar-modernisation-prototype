namespace LargeRetailer.Modernisation.Application.Features;

public interface IFeatureSliceQueryService
{
    Task<IReadOnlyCollection<PaymentReadinessItemDto>> ListPaymentReadinessAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<WarehouseSignalDto>> ListWarehouseSignalsAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<HrPlatformTaskDto>> ListHrPlatformTasksAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<InsightMetricDto>> ListInsightMetricsAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<AutomationCandidateDto>> ListAutomationCandidatesAsync(CancellationToken cancellationToken);
}
