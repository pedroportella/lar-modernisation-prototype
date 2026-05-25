using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.WorkflowReviews;

public sealed class WorkflowReviewService(IWorkflowReviewRepository repository) : IWorkflowReviewService
{
    private static readonly HashSet<string> AllowedSlices = new(StringComparer.OrdinalIgnoreCase)
    {
        "payments",
        "warehouse",
        "hr",
        "insights",
        "automation"
    };

    public async Task<WorkflowReviewDto?> GetLatestAsync(
        string slice,
        int recordId,
        CancellationToken cancellationToken)
    {
        if (!AllowedSlices.Contains(slice) || recordId <= 0)
        {
            return null;
        }

        var review = await repository.GetLatestAsync(NormaliseSlice(slice), recordId, cancellationToken);

        return review is null ? null : ToDto(review);
    }

    public async Task<WorkflowReviewResult> CreateAsync(
        string slice,
        int recordId,
        WorkflowReviewRequest request,
        CancellationToken cancellationToken)
    {
        var errors = Validate(slice, recordId, request);

        if (errors.Count > 0)
        {
            return new WorkflowReviewResult(null, errors);
        }

        var review = new WorkflowReview
        {
            Slice = NormaliseSlice(slice),
            RecordId = recordId,
            Status = Enum.Parse<TransformationStatus>(request.Status, ignoreCase: true),
            Action = request.Action.Trim(),
            Note = request.Note.Trim(),
            ReviewedBy = request.ReviewedBy.Trim(),
            ReviewedAtUtc = DateTimeOffset.UtcNow
        };

        var saved = await repository.AddAsync(review, cancellationToken);

        return new WorkflowReviewResult(ToDto(saved), new Dictionary<string, string[]>());
    }

    private static Dictionary<string, string[]> Validate(
        string slice,
        int recordId,
        WorkflowReviewRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (!AllowedSlices.Contains(slice))
        {
            errors["slice"] = ["Choose a supported feature slice."];
        }

        if (recordId <= 0)
        {
            errors["recordId"] = ["Choose a valid feature record."];
        }

        if (!Enum.TryParse<TransformationStatus>(request.Status, ignoreCase: true, out _))
        {
            errors["status"] = ["Choose a supported status."];
        }

        if (string.IsNullOrWhiteSpace(request.Action) || request.Action.Trim().Length < 8)
        {
            errors["action"] = ["Enter at least 8 characters for the action."];
        }

        if (string.IsNullOrWhiteSpace(request.Note) || request.Note.Trim().Length < 12)
        {
            errors["note"] = ["Add a note of at least 12 characters."];
        }

        if (string.IsNullOrWhiteSpace(request.ReviewedBy))
        {
            errors["reviewedBy"] = ["Enter the reviewer or role."];
        }

        return errors;
    }

    private static WorkflowReviewDto ToDto(WorkflowReview review) =>
        new(
            review.Id,
            review.Slice,
            review.RecordId,
            review.Status.ToString(),
            review.Action,
            review.Note,
            review.ReviewedBy,
            review.ReviewedAtUtc);

    private static string NormaliseSlice(string slice) => slice.Trim().ToLowerInvariant();
}
