namespace LargeRetailer.Modernisation.Domain;

public sealed class HrPlatformTask
{
    public int Id { get; set; }

    public string WorkstreamId { get; set; } = string.Empty;

    public string TaskName { get; set; } = string.Empty;

    public TransformationStatus Status { get; set; }

    public string ProcessRisk { get; set; } = string.Empty;

    public string Owner { get; set; } = string.Empty;
}
