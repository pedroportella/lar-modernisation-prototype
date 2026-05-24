using LargeRetailer.Modernisation.Application.Workstreams;
using LargeRetailer.Modernisation.Domain;
using LargeRetailer.Modernisation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LargeRetailer.Modernisation.Infrastructure.Workstreams;

public sealed class EfWorkstreamRepository(ModernisationDbContext dbContext) : IWorkstreamRepository
{
    public async Task<IReadOnlyCollection<Workstream>> ListAsync(CancellationToken cancellationToken) =>
        await dbContext.Workstreams
            .AsNoTracking()
            .OrderBy(workstream => workstream.Priority)
            .ToArrayAsync(cancellationToken);

    public Task<Workstream?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Workstreams
            .AsNoTracking()
            .Include(workstream => workstream.Initiatives)
            .FirstOrDefaultAsync(workstream => workstream.Id == id, cancellationToken);
}
