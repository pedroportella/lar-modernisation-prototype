using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Features;

public sealed class FeatureSliceQueryService(IFeatureSliceRepository repository) : IFeatureSliceQueryService
{
    private const int MaximumPageSize = 50;

    public async Task<FeatureSliceQueryResult<PaymentReadinessItemDto>> ListPaymentReadinessAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken)
    {
        var items = await repository.ListPaymentReadinessAsync(cancellationToken);

        return ApplyQuery(
            items.Select(ToDto),
            query,
            item => [item.Area, item.Status, item.Risk, item.Owner, item.NextAction],
            item => item.Status,
            new Dictionary<string, Func<PaymentReadinessItemDto, object>>(StringComparer.OrdinalIgnoreCase)
            {
                ["id"] = item => item.Id,
                ["area"] = item => item.Area,
                ["status"] = item => item.Status,
                ["risk"] = item => item.Risk,
                ["owner"] = item => item.Owner,
                ["nextAction"] = item => item.NextAction
            });
    }

    public async Task<FeatureSliceQueryResult<WarehouseSignalDto>> ListWarehouseSignalsAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken)
    {
        var signals = await repository.ListWarehouseSignalsAsync(cancellationToken);

        return ApplyQuery(
            signals.Select(ToDto),
            query,
            signal => [signal.SignalName, signal.CurrentValue, signal.Unit, signal.Status, signal.Opportunity],
            signal => signal.Status,
            new Dictionary<string, Func<WarehouseSignalDto, object>>(StringComparer.OrdinalIgnoreCase)
            {
                ["id"] = signal => signal.Id,
                ["signalName"] = signal => signal.SignalName,
                ["currentValue"] = signal => signal.CurrentValue,
                ["unit"] = signal => signal.Unit,
                ["status"] = signal => signal.Status,
                ["opportunity"] = signal => signal.Opportunity
            });
    }

    public async Task<FeatureSliceQueryResult<HrPlatformTaskDto>> ListHrPlatformTasksAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken)
    {
        var tasks = await repository.ListHrPlatformTasksAsync(cancellationToken);

        return ApplyQuery(
            tasks.Select(ToDto),
            query,
            task => [task.TaskName, task.Status, task.ProcessRisk, task.Owner],
            task => task.Status,
            new Dictionary<string, Func<HrPlatformTaskDto, object>>(StringComparer.OrdinalIgnoreCase)
            {
                ["id"] = task => task.Id,
                ["taskName"] = task => task.TaskName,
                ["status"] = task => task.Status,
                ["processRisk"] = task => task.ProcessRisk,
                ["owner"] = task => task.Owner
            });
    }

    public async Task<FeatureSliceQueryResult<InsightMetricDto>> ListInsightMetricsAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken)
    {
        var metrics = await repository.ListInsightMetricsAsync(cancellationToken);

        return ApplyQuery(
            metrics.Select(ToDto),
            query,
            metric => [metric.MetricName, metric.Value, metric.Unit, metric.Status],
            metric => metric.Status,
            new Dictionary<string, Func<InsightMetricDto, object>>(StringComparer.OrdinalIgnoreCase)
            {
                ["id"] = metric => metric.Id,
                ["metricName"] = metric => metric.MetricName,
                ["value"] = metric => metric.Value,
                ["unit"] = metric => metric.Unit,
                ["status"] = metric => metric.Status
            });
    }

    public async Task<FeatureSliceQueryResult<AutomationCandidateDto>> ListAutomationCandidatesAsync(
        FeatureSliceQuery query,
        CancellationToken cancellationToken)
    {
        var candidates = await repository.ListAutomationCandidatesAsync(cancellationToken);

        return ApplyQuery(
            candidates.Select(ToDto),
            query,
            candidate => [
                candidate.WorkflowName,
                candidate.ValueScore,
                candidate.EffortScore,
                candidate.RiskClass,
                candidate.RecommendedNextStep
            ],
            _ => null,
            new Dictionary<string, Func<AutomationCandidateDto, object>>(StringComparer.OrdinalIgnoreCase)
            {
                ["id"] = candidate => candidate.Id,
                ["workflowName"] = candidate => candidate.WorkflowName,
                ["valueScore"] = candidate => candidate.ValueScore,
                ["effortScore"] = candidate => candidate.EffortScore,
                ["riskClass"] = candidate => candidate.RiskClass,
                ["recommendedNextStep"] = candidate => candidate.RecommendedNextStep
            });
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

    private static FeatureSliceQueryResult<T> ApplyQuery<T>(
        IEnumerable<T> source,
        FeatureSliceQuery query,
        Func<T, IEnumerable<object?>> searchableValues,
        Func<T, string?> statusValue,
        IReadOnlyDictionary<string, Func<T, object>> sortFields)
    {
        var errors = Validate(query, sortFields);

        if (errors.Count > 0)
        {
            return new FeatureSliceQueryResult<T>(null, errors);
        }

        var filtered = source;
        var search = query.Search?.Trim();

        if (!string.IsNullOrWhiteSpace(search))
        {
            filtered = filtered.Where(item =>
                searchableValues(item).Any(value =>
                    value is not null &&
                    value.ToString()!.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && !string.Equals(query.Status, "all", StringComparison.OrdinalIgnoreCase))
        {
            filtered = filtered.Where(item => string.Equals(statusValue(item), query.Status, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.Sort))
        {
            var sort = query.Sort.Trim();
            var descending = sort[0] == '-';
            var sortField = descending ? sort[1..] : sort;
            var selector = sortFields[sortField];

            filtered = descending
                ? filtered.OrderByDescending(selector)
                : filtered.OrderBy(selector);
        }

        var totalItems = filtered.Count();
        var totalPages = totalItems == 0 ? 0 : (int)Math.Ceiling(totalItems / (decimal)query.PageSize);
        var pageItems = filtered
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToArray();

        return new FeatureSliceQueryResult<T>(
            new PagedResponse<T>(pageItems, query.Page, query.PageSize, totalItems, totalPages),
            new Dictionary<string, string[]>());
    }

    private static Dictionary<string, string[]> Validate<T>(
        FeatureSliceQuery query,
        IReadOnlyDictionary<string, Func<T, object>> sortFields)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (query.Page < 1)
        {
            errors["page"] = ["Page must be greater than or equal to 1."];
        }

        if (query.PageSize is < 1 or > MaximumPageSize)
        {
            errors["pageSize"] = [$"Page size must be between 1 and {MaximumPageSize}."];
        }

        if (!string.IsNullOrWhiteSpace(query.Sort))
        {
            var sort = query.Sort.Trim();
            var sortField = sort[0] == '-' ? sort[1..] : sort;

            if (sortField.Length == 0 || !sortFields.ContainsKey(sortField))
            {
                errors["sort"] = [$"Sort must be one of: {string.Join(", ", sortFields.Keys)}. Prefix with '-' for descending order."];
            }
        }

        return errors;
    }
}
