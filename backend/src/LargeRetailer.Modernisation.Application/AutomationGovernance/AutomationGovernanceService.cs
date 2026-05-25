using LargeRetailer.Modernisation.Domain;

namespace LargeRetailer.Modernisation.Application.AutomationGovernance;

public sealed class AutomationGovernanceService(IAutomationGovernanceRepository repository) : IAutomationGovernanceService
{
    private static readonly HashSet<string> AllowedTriageStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "NeedsEvidence",
        "ApprovedForPrototype",
        "RequiresGovernanceBoard",
        "Rejected"
    };

    private static readonly HashSet<string> AllowedDataSensitivity = new(StringComparer.OrdinalIgnoreCase)
    {
        "Public",
        "Internal",
        "Confidential",
        "Restricted"
    };

    private static readonly HashSet<string> AllowedModelRisk = new(StringComparer.OrdinalIgnoreCase)
    {
        "Low",
        "Medium",
        "High"
    };

    public async Task<AutomationGovernanceReviewDto?> GetLatestAsync(
        int candidateId,
        CancellationToken cancellationToken)
    {
        if (candidateId <= 0)
        {
            return null;
        }

        var review = await repository.GetLatestAsync(candidateId, cancellationToken);

        return review is null ? null : ToDto(review);
    }

    public async Task<AutomationGovernanceReviewResult> CreateAsync(
        int candidateId,
        AutomationGovernanceReviewRequest request,
        CancellationToken cancellationToken)
    {
        var latest = candidateId > 0
            ? await repository.GetLatestAsync(candidateId, cancellationToken)
            : null;
        var candidateExists = candidateId > 0 &&
            await repository.CandidateExistsAsync(candidateId, cancellationToken);
        var errors = Validate(candidateId, candidateExists, latest, request);

        if (errors.Count > 0)
        {
            return new AutomationGovernanceReviewResult(null, errors);
        }

        var review = new AutomationGovernanceReview
        {
            CandidateId = candidateId,
            TriageStatus = Normalise(request.TriageStatus),
            DataSensitivity = Normalise(request.DataSensitivity),
            HumanApprovalRequired = request.HumanApprovalRequired,
            ModelRisk = Normalise(request.ModelRisk),
            ExpectedBenefit = request.ExpectedBenefit.Trim(),
            EvidenceSource = request.EvidenceSource.Trim(),
            ReviewedBy = request.ReviewedBy.Trim(),
            ReviewedAtUtc = DateTimeOffset.UtcNow
        };

        var saved = await repository.AddAsync(review, cancellationToken);

        return new AutomationGovernanceReviewResult(ToDto(saved), new Dictionary<string, string[]>());
    }

    private static Dictionary<string, string[]> Validate(
        int candidateId,
        bool candidateExists,
        AutomationGovernanceReview? latest,
        AutomationGovernanceReviewRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (candidateId <= 0 || !candidateExists)
        {
            errors["candidateId"] = ["Choose a valid automation candidate."];
        }

        if (!AllowedTriageStatuses.Contains(request.TriageStatus))
        {
            errors["triageStatus"] = ["Choose a supported governance triage status."];
        }

        if (!AllowedDataSensitivity.Contains(request.DataSensitivity))
        {
            errors["dataSensitivity"] = ["Choose a supported data sensitivity."];
        }

        if (!AllowedModelRisk.Contains(request.ModelRisk))
        {
            errors["modelRisk"] = ["Choose a supported model risk level."];
        }

        if (string.IsNullOrWhiteSpace(request.ExpectedBenefit) || request.ExpectedBenefit.Trim().Length < 12)
        {
            errors["expectedBenefit"] = ["Describe the expected benefit in at least 12 characters."];
        }

        if (string.IsNullOrWhiteSpace(request.EvidenceSource) || request.EvidenceSource.Trim().Length < 8)
        {
            errors["evidenceSource"] = ["Name the evidence or source used for this review."];
        }

        if (string.IsNullOrWhiteSpace(request.ReviewedBy))
        {
            errors["reviewedBy"] = ["Enter the reviewer or accountable role."];
        }

        var isHighRisk = string.Equals(request.ModelRisk, "High", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(request.DataSensitivity, "Restricted", StringComparison.OrdinalIgnoreCase);

        if (isHighRisk && !request.HumanApprovalRequired)
        {
            errors["humanApprovalRequired"] = ["High-risk or restricted-data candidates require human approval."];
        }

        if (latest is not null &&
            string.Equals(latest.TriageStatus, "Rejected", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(request.TriageStatus, "ApprovedForPrototype", StringComparison.OrdinalIgnoreCase))
        {
            errors["triageStatus"] = ["Rejected candidates need a new intake before approval for prototype."];
        }

        return errors;
    }

    private static AutomationGovernanceReviewDto ToDto(AutomationGovernanceReview review) =>
        new(
            review.Id,
            review.CandidateId,
            review.TriageStatus,
            review.DataSensitivity,
            review.HumanApprovalRequired,
            review.ModelRisk,
            review.ExpectedBenefit,
            review.EvidenceSource,
            review.ReviewedBy,
            review.ReviewedAtUtc);

    private static string Normalise(string value) => value.Trim();
}
