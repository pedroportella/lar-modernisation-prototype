namespace LargeRetailer.Modernisation.Domain;

public sealed class AutomationCandidate
{
    public int Id { get; set; }

    public string WorkstreamId { get; set; } = string.Empty;

    public string WorkflowName { get; set; } = string.Empty;

    public int ValueScore { get; set; }

    public int EffortScore { get; set; }

    public string RiskClass { get; set; } = string.Empty;

    public string RecommendedNextStep { get; set; } = string.Empty;
}
