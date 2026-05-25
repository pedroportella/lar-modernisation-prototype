using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.AutomationGovernance;

public interface IAutomationGovernanceRepository
{
    Task<bool> CandidateExistsAsync(int candidateId, CancellationToken cancellationToken);

    Task<AutomationGovernanceReview?> GetLatestAsync(int candidateId, CancellationToken cancellationToken);

    Task<AutomationGovernanceReview> AddAsync(
        AutomationGovernanceReview review,
        CancellationToken cancellationToken);
}
