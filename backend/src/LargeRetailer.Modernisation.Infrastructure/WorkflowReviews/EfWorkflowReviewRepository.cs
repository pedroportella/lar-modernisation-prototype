using LargeRetailer.Modernisation.Application.WorkflowReviews;
using LargeRetailer.Modernisation.Domain;
using LargeRetailer.Modernisation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LargeRetailer.Modernisation.Infrastructure.WorkflowReviews;

public sealed class EfWorkflowReviewRepository(ModernisationDbContext dbContext) : IWorkflowReviewRepository
{
    public Task<WorkflowReview?> GetLatestAsync(
        string slice,
        int recordId,
        CancellationToken cancellationToken) =>
        dbContext.WorkflowReviews
            .AsNoTracking()
            .Where(review => review.Slice == slice && review.RecordId == recordId)
            .OrderByDescending(review => review.Id)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<WorkflowReview> AddAsync(WorkflowReview review, CancellationToken cancellationToken)
    {
        dbContext.WorkflowReviews.Add(review);
        await dbContext.SaveChangesAsync(cancellationToken);

        return review;
    }
}
