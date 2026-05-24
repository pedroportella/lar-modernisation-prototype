using LargeRetailer.Modernisation.Application.Features;
using LargeRetailer.Modernisation.Domain;
using LargeRetailer.Modernisation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LargeRetailer.Modernisation.Infrastructure.Features;

public sealed class EfFeatureSliceRepository(ModernisationDbContext dbContext) : IFeatureSliceRepository
{
    public async Task<IReadOnlyCollection<MigrationReadinessItem>> ListPaymentReadinessAsync(CancellationToken cancellationToken) =>
        await dbContext.MigrationReadinessItems
            .AsNoTracking()
            .OrderBy(item => item.Id)
            .ToArrayAsync(cancellationToken);

    public async Task<IReadOnlyCollection<WarehouseSignal>> ListWarehouseSignalsAsync(CancellationToken cancellationToken) =>
        await dbContext.WarehouseSignals
            .AsNoTracking()
            .OrderBy(signal => signal.Id)
            .ToArrayAsync(cancellationToken);

    public async Task<IReadOnlyCollection<HrPlatformTask>> ListHrPlatformTasksAsync(CancellationToken cancellationToken) =>
        await dbContext.HrPlatformTasks
            .AsNoTracking()
            .OrderBy(task => task.Id)
            .ToArrayAsync(cancellationToken);

    public async Task<IReadOnlyCollection<InsightMetric>> ListInsightMetricsAsync(CancellationToken cancellationToken) =>
        await dbContext.InsightMetrics
            .AsNoTracking()
            .OrderBy(metric => metric.Id)
            .ToArrayAsync(cancellationToken);

    public async Task<IReadOnlyCollection<AutomationCandidate>> ListAutomationCandidatesAsync(CancellationToken cancellationToken) =>
        await dbContext.AutomationCandidates
            .AsNoTracking()
            .OrderBy(candidate => candidate.Id)
            .ToArrayAsync(cancellationToken);
}
