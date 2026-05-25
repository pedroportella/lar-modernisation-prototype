namespace LargeRetailer.Modernisation.Application.Features;

public interface IFeatureSliceQueryService
{
    Task<FeatureSliceQueryResult<PaymentReadinessItemDto>> ListPaymentReadinessAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken);

    Task<FeatureSliceQueryResult<WarehouseSignalDto>> ListWarehouseSignalsAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken);

    Task<FeatureSliceQueryResult<HrPlatformTaskDto>> ListHrPlatformTasksAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken);

    Task<FeatureSliceQueryResult<InsightMetricDto>> ListInsightMetricsAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken);

    Task<FeatureSliceQueryResult<AutomationCandidateDto>> ListAutomationCandidatesAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken);
}
