using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Features;

public interface IFeatureSliceRepository
{
    Task<IReadOnlyCollection<MigrationReadinessItem>> ListPaymentReadinessAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<WarehouseSignal>> ListWarehouseSignalsAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<HrPlatformTask>> ListHrPlatformTasksAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<InsightMetric>> ListInsightMetricsAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<AutomationCandidate>> ListAutomationCandidatesAsync(CancellationToken cancellationToken);
}
