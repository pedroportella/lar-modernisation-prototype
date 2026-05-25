using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.WorkflowReviews;

public interface IWorkflowReviewRepository
{
    Task<WorkflowReview?> GetLatestAsync(string slice, int recordId, CancellationToken cancellationToken);

    Task<WorkflowReview> AddAsync(WorkflowReview review, CancellationToken cancellationToken);
}
