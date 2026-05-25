namespace LargeRetailer.Modernisation.Domain;

public sealed class WorkflowReview
{
    public int Id { get; set; }

    public string Slice { get; set; } = string.Empty;

    public int RecordId { get; set; }

    public TransformationStatus Status { get; set; }

    public string Action { get; set; } = string.Empty;

    public string Note { get; set; } = string.Empty;

    public string ReviewedBy { get; set; } = string.Empty;

    public DateTimeOffset ReviewedAtUtc { get; set; }
}
