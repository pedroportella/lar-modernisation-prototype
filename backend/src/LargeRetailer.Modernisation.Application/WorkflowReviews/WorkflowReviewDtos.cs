namespace LargeRetailer.Modernisation.Application.WorkflowReviews;

public sealed record WorkflowReviewDto(
    int Id,
    string Slice,
    int RecordId,
    string Status,
    string Action,
    string Note,
    string ReviewedBy,
    DateTimeOffset ReviewedAtUtc);

public sealed record WorkflowReviewRequest(
    string Status,
    string Action,
    string Note,
    string ReviewedBy);

public sealed record WorkflowReviewResult(
    WorkflowReviewDto? Review,
    IReadOnlyDictionary<string, string[]> Errors)
{
    public bool IsValid => Errors.Count == 0;
}
