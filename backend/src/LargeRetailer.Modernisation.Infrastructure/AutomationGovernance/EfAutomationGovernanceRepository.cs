using LargeRetailer.Modernisation.Application.AutomationGovernance;
using LargeRetailer.Modernisation.Domain;
using LargeRetailer.Modernisation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LargeRetailer.Modernisation.Infrastructure.AutomationGovernance;

public sealed class EfAutomationGovernanceRepository(ModernisationDbContext dbContext) : IAutomationGovernanceRepository
{
    public Task<bool> CandidateExistsAsync(int candidateId, CancellationToken cancellationToken) =>
        dbContext.AutomationCandidates
            .AsNoTracking()
            .AnyAsync(candidate => candidate.Id == candidateId, cancellationToken);

    public Task<AutomationGovernanceReview?> GetLatestAsync(
        int candidateId,
        CancellationToken cancellationToken) =>
        dbContext.AutomationGovernanceReviews
            .AsNoTracking()
            .Where(review => review.CandidateId == candidateId)
            .OrderByDescending(review => review.Id)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<AutomationGovernanceReview> AddAsync(
        AutomationGovernanceReview review,
        CancellationToken cancellationToken)
    {
        dbContext.AutomationGovernanceReviews.Add(review);
        await dbContext.SaveChangesAsync(cancellationToken);

        return review;
    }
}
