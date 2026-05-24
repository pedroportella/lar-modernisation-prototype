namespace LargeRetailer.Modernisation.Application.Workstreams;

public sealed record InitiativeDto(
    int Id,
    string Name,
    string Status,
    string Owner,
    string NextAction);

public sealed record WorkstreamDto(
    string Id,
    string Name,
    string Status,
    string Summary,
    int Priority);

public sealed record WorkstreamDetailDto(
    string Id,
    string Name,
    string Status,
    string Summary,
    int Priority,
    IReadOnlyCollection<InitiativeDto> Initiatives);
