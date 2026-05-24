using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Workstreams;

public sealed class WorkstreamQueryService(IWorkstreamRepository repository) : IWorkstreamQueryService
{
    public async Task<IReadOnlyCollection<WorkstreamDto>> ListAsync(CancellationToken cancellationToken)
    {
        var workstreams = await repository.ListAsync(cancellationToken);

        return workstreams
            .OrderBy(workstream => workstream.Priority)
            .Select(ToDto)
            .ToArray();
    }

    public async Task<WorkstreamDetailDto?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        var workstream = await repository.GetByIdAsync(id, cancellationToken);

        return workstream is null ? null : ToDetailDto(workstream);
    }

    private static WorkstreamDto ToDto(Workstream workstream) =>
        new(
            workstream.Id,
            workstream.Name,
            workstream.Status.ToString(),
            workstream.Summary,
            workstream.Priority);

    private static WorkstreamDetailDto ToDetailDto(Workstream workstream) =>
        new(
            workstream.Id,
            workstream.Name,
            workstream.Status.ToString(),
            workstream.Summary,
            workstream.Priority,
            workstream.Initiatives
                .OrderBy(initiative => initiative.Id)
                .Select(ToDto)
                .ToArray());

    private static InitiativeDto ToDto(Initiative initiative) =>
        new(
            initiative.Id,
            initiative.Name,
            initiative.Status.ToString(),
            initiative.Owner,
            initiative.NextAction);
}
