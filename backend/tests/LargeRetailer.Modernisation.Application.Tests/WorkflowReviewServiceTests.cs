using LargeRetailer.Modernisation.Application.WorkflowReviews;
using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Tests;

public sealed class WorkflowReviewServiceTests
{
    [Fact]
    public async Task CreateAsync_stores_review_and_returns_saved_payload()
    {
        var repository = new InMemoryWorkflowReviewRepository();
        var service = new WorkflowReviewService(repository);

        var result = await service.CreateAsync(
            "payments",
            1,
            new WorkflowReviewRequest(
                "Blocked",
                "Escalate cutover dependency",
                "Reviewed with release lead and dependency owner.",
                "Delivery lead"),
            CancellationToken.None);

        Assert.True(result.IsValid);
        Assert.NotNull(result.Review);
        Assert.Equal("payments", result.Review.Slice);
        Assert.Equal(1, result.Review.RecordId);
        Assert.Equal("Blocked", result.Review.Status);
        Assert.Equal("Escalate cutover dependency", result.Review.Action);
    }

    [Fact]
    public async Task GetLatestAsync_returns_latest_review_for_record()
    {
        var repository = new InMemoryWorkflowReviewRepository();
        var service = new WorkflowReviewService(repository);

        await service.CreateAsync(
            "payments",
            1,
            new WorkflowReviewRequest(
                "AtRisk",
                "Check release sequencing",
                "Initial review with release lead.",
                "Delivery lead"),
            CancellationToken.None);
        await service.CreateAsync(
            "payments",
            1,
            new WorkflowReviewRequest(
                "Blocked",
                "Escalate cutover dependency",
                "Second review with release lead and dependency owner.",
                "Delivery lead"),
            CancellationToken.None);

        var review = await service.GetLatestAsync("payments", 1, CancellationToken.None);

        Assert.NotNull(review);
        Assert.Equal("Blocked", review.Status);
        Assert.Equal("Escalate cutover dependency", review.Action);
    }

    [Fact]
    public async Task CreateAsync_returns_validation_errors_for_invalid_payload()
    {
        var service = new WorkflowReviewService(new InMemoryWorkflowReviewRepository());

        var result = await service.CreateAsync(
            "unknown",
            0,
            new WorkflowReviewRequest("NotReal", "short", "tiny", ""),
            CancellationToken.None);

        Assert.False(result.IsValid);
        Assert.Contains("slice", result.Errors.Keys);
        Assert.Contains("recordId", result.Errors.Keys);
        Assert.Contains("status", result.Errors.Keys);
        Assert.Contains("action", result.Errors.Keys);
        Assert.Contains("note", result.Errors.Keys);
        Assert.Contains("reviewedBy", result.Errors.Keys);
    }

    private sealed class InMemoryWorkflowReviewRepository : IWorkflowReviewRepository
    {
        private readonly List<WorkflowReview> reviews = [];
        private int nextId = 1;

        public Task<WorkflowReview?> GetLatestAsync(
            string slice,
            int recordId,
            CancellationToken cancellationToken)
        {
            var review = reviews
                .Where(candidate => candidate.Slice == slice && candidate.RecordId == recordId)
                .OrderByDescending(candidate => candidate.ReviewedAtUtc)
                .ThenByDescending(candidate => candidate.Id)
                .FirstOrDefault();

            return Task.FromResult(review);
        }

        public Task<WorkflowReview> AddAsync(WorkflowReview review, CancellationToken cancellationToken)
        {
            review.Id = nextId++;
            review.ReviewedAtUtc = review.ReviewedAtUtc.AddMilliseconds(review.Id);
            reviews.Add(review);

            return Task.FromResult(review);
        }
    }
}
