namespace LargeRetailer.Modernisation.Domain;

public sealed class InsightMetric
{
    public int Id { get; set; }

    public string WorkstreamId { get; set; } = string.Empty;

    public string MetricName { get; set; } = string.Empty;

    public decimal Value { get; set; }

    public string Unit { get; set; } = string.Empty;

    public TransformationStatus Status { get; set; }
}
