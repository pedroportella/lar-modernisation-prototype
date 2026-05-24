using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Workstreams;

public interface IWorkstreamRepository
{
    Task<IReadOnlyCollection<Workstream>> ListAsync(CancellationToken cancellationToken);

    Task<Workstream?> GetByIdAsync(string id, CancellationToken cancellationToken);
}
