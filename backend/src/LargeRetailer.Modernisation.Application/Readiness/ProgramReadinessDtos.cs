namespace LargeRetailer.Modernisation.Application.Readiness;

public sealed record ProgramReadinessDto(
    string OverallStatus,
    int ReadinessScore,
    string Summary,
    IReadOnlyCollection<ReadinessSignalDto> Signals,
    IReadOnlyCollection<RecommendedActionDto> RecommendedActions);

public sealed record ReadinessSignalDto(
    string Label,
    int Value,
    string Status);

public sealed record RecommendedActionDto(
    string WorkstreamId,
    string WorkstreamName,
    string Initiative,
    string Owner,
    string Status,
    string NextAction);
