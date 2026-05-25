namespace LargeRetailer.Modernisation.Domain;

public sealed class AutomationGovernanceReview
{
    public int Id { get; set; }

    public int CandidateId { get; set; }

    public string TriageStatus { get; set; } = string.Empty;

    public string DataSensitivity { get; set; } = string.Empty;

    public bool HumanApprovalRequired { get; set; }

    public string ModelRisk { get; set; } = string.Empty;

    public string ExpectedBenefit { get; set; } = string.Empty;

    public string EvidenceSource { get; set; } = string.Empty;

    public string ReviewedBy { get; set; } = string.Empty;

    public DateTimeOffset ReviewedAtUtc { get; set; }
}
