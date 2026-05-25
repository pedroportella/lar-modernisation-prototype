namespace LargeRetailer.Modernisation.Application.WorkflowReviews;

public interface IWorkflowReviewService
{
    Task<WorkflowReviewDto?> GetLatestAsync(
        string slice,
        int recordId,
        CancellationToken cancellationToken);

    Task<WorkflowReviewResult> CreateAsync(
        string slice,
        int recordId,
        WorkflowReviewRequest request,
        CancellationToken cancellationToken);
}
