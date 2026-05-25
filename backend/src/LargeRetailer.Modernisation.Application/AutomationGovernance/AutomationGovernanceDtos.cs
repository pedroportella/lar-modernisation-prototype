namespace LargeRetailer.Modernisation.Application.AutomationGovernance;

public sealed record AutomationGovernanceReviewDto(
    int Id,
    int CandidateId,
    string TriageStatus,
    string DataSensitivity,
    bool HumanApprovalRequired,
    string ModelRisk,
    string ExpectedBenefit,
    string EvidenceSource,
    string ReviewedBy,
    DateTimeOffset ReviewedAtUtc);

public sealed record AutomationGovernanceReviewRequest(
    string TriageStatus,
    string DataSensitivity,
    bool HumanApprovalRequired,
    string ModelRisk,
    string ExpectedBenefit,
    string EvidenceSource,
    string ReviewedBy);

public sealed record AutomationGovernanceReviewResult(
    AutomationGovernanceReviewDto? Review,
    IReadOnlyDictionary<string, string[]> Errors)
{
    public bool IsValid => Errors.Count == 0 && Review is not null;
}
