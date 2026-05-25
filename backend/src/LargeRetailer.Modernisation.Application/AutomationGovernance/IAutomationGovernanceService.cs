namespace LargeRetailer.Modernisation.Application.AutomationGovernance;

public interface IAutomationGovernanceService
{
    Task<AutomationGovernanceReviewDto?> GetLatestAsync(
        int candidateId,
        CancellationToken cancellationToken);

    Task<AutomationGovernanceReviewResult> CreateAsync(
        int candidateId,
        AutomationGovernanceReviewRequest request,
        CancellationToken cancellationToken);
}
