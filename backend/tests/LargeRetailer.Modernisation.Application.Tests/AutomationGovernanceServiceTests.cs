using LargeRetailer.Modernisation.Application.AutomationGovernance;
using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.Tests;

public sealed class AutomationGovernanceServiceTests
{
    [Fact]
    public async Task CreateAsync_persists_governance_review()
    {
        var repository = new InMemoryAutomationGovernanceRepository(candidateExists: true);
        var service = new AutomationGovernanceService(repository);

        var result = await service.CreateAsync(
            1,
            new AutomationGovernanceReviewRequest(
                "ApprovedForPrototype",
                "Internal",
                false,
                "Medium",
                "Reduce manual triage effort",
                "Discovery workshop notes",
                "Automation lead"),
            CancellationToken.None);

        Assert.True(result.IsValid);
        Assert.NotNull(result.Review);
        Assert.Equal("ApprovedForPrototype", result.Review.TriageStatus);
        Assert.Equal("Discovery workshop notes", result.Review.EvidenceSource);
    }

    [Theory]
    [InlineData("High", "Internal")]
    [InlineData("Medium", "Restricted")]
    public async Task CreateAsync_requires_human_approval_for_high_risk_candidates(
        string modelRisk,
        string dataSensitivity)
    {
        var service = new AutomationGovernanceService(new InMemoryAutomationGovernanceRepository(candidateExists: true));

        var result = await service.CreateAsync(
            1,
            new AutomationGovernanceReviewRequest(
                "RequiresGovernanceBoard",
                dataSensitivity,
                false,
                modelRisk,
                "Reduce manual triage effort",
                "Discovery workshop notes",
                "Automation lead"),
            CancellationToken.None);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey("humanApprovalRequired"));
    }

    [Fact]
    public async Task CreateAsync_rejects_unsupported_transition_from_rejected_to_approved()
    {
        var repository = new InMemoryAutomationGovernanceRepository(candidateExists: true);
        repository.Reviews.Add(new AutomationGovernanceReview
        {
            Id = 1,
            CandidateId = 1,
            TriageStatus = "Rejected",
            DataSensitivity = "Internal",
            HumanApprovalRequired = false,
            ModelRisk = "Low",
            ExpectedBenefit = "Low value against effort",
            EvidenceSource = "Governance review",
            ReviewedBy = "Automation lead",
            ReviewedAtUtc = DateTimeOffset.UtcNow
        });
        var service = new AutomationGovernanceService(repository);

        var result = await service.CreateAsync(
            1,
            new AutomationGovernanceReviewRequest(
                "ApprovedForPrototype",
                "Internal",
                false,
                "Low",
                "Reduce manual triage effort",
                "Discovery workshop notes",
                "Automation lead"),
            CancellationToken.None);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey("triageStatus"));
    }

    private sealed class InMemoryAutomationGovernanceRepository(bool candidateExists) : IAutomationGovernanceRepository
    {
        public List<AutomationGovernanceReview> Reviews { get; } = [];

        public Task<bool> CandidateExistsAsync(int candidateId, CancellationToken cancellationToken) =>
            Task.FromResult(candidateExists);

        public Task<AutomationGovernanceReview?> GetLatestAsync(
            int candidateId,
            CancellationToken cancellationToken) =>
            Task.FromResult(
                Reviews
                    .Where(review => review.CandidateId == candidateId)
                    .OrderByDescending(review => review.Id)
                    .FirstOrDefault());

        public Task<AutomationGovernanceReview> AddAsync(
            AutomationGovernanceReview review,
            CancellationToken cancellationToken)
        {
            review.Id = Reviews.Count + 1;
            Reviews.Add(review);

            return Task.FromResult(review);
        }
    }
}
