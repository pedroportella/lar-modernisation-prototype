namespace LargeRetailer.Modernisation.Domain;

public sealed class WarehouseSignal
{
    public int Id { get; set; }

    public string WorkstreamId { get; set; } = string.Empty;

    public string SignalName { get; set; } = string.Empty;

    public decimal CurrentValue { get; set; }

    public string Unit { get; set; } = string.Empty;

    public TransformationStatus Status { get; set; }

    public string Opportunity { get; set; } = string.Empty;
}
