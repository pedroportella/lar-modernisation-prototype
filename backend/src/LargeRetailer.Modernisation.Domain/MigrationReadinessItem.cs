namespace LargeRetailer.Modernisation.Domain;

public sealed class MigrationReadinessItem
{
    public int Id { get; set; }

    public string WorkstreamId { get; set; } = string.Empty;

    public string Area { get; set; } = string.Empty;

    public TransformationStatus Status { get; set; }

    public string Risk { get; set; } = string.Empty;

    public string Owner { get; set; } = string.Empty;

    public string NextAction { get; set; } = string.Empty;
}
