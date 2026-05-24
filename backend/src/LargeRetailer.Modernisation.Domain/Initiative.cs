namespace LargeRetailer.Modernisation.Domain;

public sealed class Initiative
{
    public int Id { get; set; }

    public string WorkstreamId { get; set; } = string.Empty;

    public Workstream? Workstream { get; set; }

    public string Name { get; set; } = string.Empty;

    public TransformationStatus Status { get; set; }

    public string Owner { get; set; } = string.Empty;

    public string NextAction { get; set; } = string.Empty;
}
