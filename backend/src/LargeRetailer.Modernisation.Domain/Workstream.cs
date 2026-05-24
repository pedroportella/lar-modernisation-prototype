namespace LargeRetailer.Modernisation.Domain;

public sealed class Workstream
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public TransformationStatus Status { get; set; }

    public string Summary { get; set; } = string.Empty;

    public int Priority { get; set; }

    public List<Initiative> Initiatives { get; set; } = [];
}
