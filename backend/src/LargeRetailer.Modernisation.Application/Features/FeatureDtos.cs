namespace LargeRetailer.Modernisation.Application.Features;

public sealed record PaymentReadinessItemDto(
    int Id,
    string Area,
    string Status,
    string Risk,
    string Owner,
    string NextAction);

public sealed record WarehouseSignalDto(
    int Id,
    string SignalName,
    decimal CurrentValue,
    string Unit,
    string Status,
    string Opportunity);

public sealed record HrPlatformTaskDto(
    int Id,
    string TaskName,
    string Status,
    string ProcessRisk,
    string Owner);

public sealed record InsightMetricDto(
    int Id,
    string MetricName,
    decimal Value,
    string Unit,
    string Status);

public sealed record AutomationCandidateDto(
    int Id,
    string WorkflowName,
    int ValueScore,
    int EffortScore,
    string RiskClass,
    string RecommendedNextStep);
