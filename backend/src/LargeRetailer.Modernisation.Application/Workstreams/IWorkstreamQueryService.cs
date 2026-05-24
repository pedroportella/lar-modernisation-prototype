namespace LargeRetailer.Modernisation.Application.Workstreams;

public interface IWorkstreamQueryService
{
    Task<IReadOnlyCollection<WorkstreamDto>> ListAsync(CancellationToken cancellationToken);

    Task<WorkstreamDetailDto?> GetByIdAsync(string id, CancellationToken cancellationToken);
}
