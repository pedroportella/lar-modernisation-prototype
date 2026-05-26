using LargeRetailer.Modernisation.Domain;
using Microsoft.EntityFrameworkCore;

namespace LargeRetailer.Modernisation.Infrastructure.Persistence;

public static class ModernisationSeedData
{
    public static async Task EnsureSeededAsync(ModernisationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        await dbContext.Database.EnsureCreatedAsync(cancellationToken);
        await EnsureWorkflowReviewSchemaAsync(dbContext, cancellationToken);
        await EnsureAutomationGovernanceReviewSchemaAsync(dbContext, cancellationToken);

        if (await dbContext.Workstreams.AnyAsync(cancellationToken))
        {
            return;
        }

        dbContext.Workstreams.AddRange(
            new Workstream
            {
                Id = "payments",
                Name = "Payment migration",
                Status = TransformationStatus.AtRisk,
                Summary = "Prepare the current payment platform for migration to a Stripe-style provider boundary.",
                Priority = 1,
                Initiatives =
                [
                    new Initiative
                    {
                        Name = "Provider adapter contract",
                        Status = TransformationStatus.OnTrack,
                        Owner = "Payments squad",
                        NextAction = "Confirm tokenisation and reconciliation DTOs."
                    },
                    new Initiative
                    {
                        Name = "Cutover readiness review",
                        Status = TransformationStatus.AtRisk,
                        Owner = "Release lead",
                        NextAction = "Separate PCI review from local prototype assumptions."
                    }
                ]
            },
            new Workstream
            {
                Id = "warehouse",
                Name = "Warehouse optimisation",
                Status = TransformationStatus.Monitoring,
                Summary = "Surface fulfilment signals that show where pick, pack and dispatch friction may exist.",
                Priority = 2,
                Initiatives =
                [
                    new Initiative
                    {
                        Name = "Operational signal baseline",
                        Status = TransformationStatus.Monitoring,
                        Owner = "Warehouse systems",
                        NextAction = "Validate seed metrics against the planned WMS gateway."
                    }
                ]
            },
            new Workstream
            {
                Id = "hr-platform",
                Name = "HR platform uplift",
                Status = TransformationStatus.OnTrack,
                Summary = "Track people-platform uplift tasks, process risk and integration readiness.",
                Priority = 3,
                Initiatives =
                [
                    new Initiative
                    {
                        Name = "Identity boundary mapping",
                        Status = TransformationStatus.OnTrack,
                        Owner = "People systems",
                        NextAction = "Name SSO and approval workflow assumptions in the runbook."
                    }
                ]
            },
            new Workstream
            {
                Id = "insights",
                Name = "Wayfinding insights",
                Status = TransformationStatus.OnTrack,
                Summary = "Give leaders a compact view of workstream health and decision-support signals.",
                Priority = 4,
                Initiatives =
                [
                    new Initiative
                    {
                        Name = "Dashboard metric catalogue",
                        Status = TransformationStatus.OnTrack,
                        Owner = "Insights lead",
                        NextAction = "Define stable API DTOs before frontend feature routes."
                    }
                ]
            },
            new Workstream
            {
                Id = "automation",
                Name = "Automation opportunity queue",
                Status = TransformationStatus.Monitoring,
                Summary = "Prioritise automation candidates with explicit governance boundaries.",
                Priority = 5,
                Initiatives =
                [
                    new Initiative
                    {
                        Name = "Candidate triage model",
                        Status = TransformationStatus.Monitoring,
                        Owner = "Automation lead",
                        NextAction = "Score effort, value and human approval requirements."
                    }
                ]
            });

        dbContext.MigrationReadinessItems.AddRange(
            new MigrationReadinessItem
            {
                WorkstreamId = "payments",
                Area = "Token migration",
                Status = TransformationStatus.AtRisk,
                Risk = "Production token movement requires PCI and provider-specific controls.",
                Owner = "Payments squad",
                NextAction = "Keep local data synthetic and document the adapter boundary."
            },
            new MigrationReadinessItem
            {
                WorkstreamId = "payments",
                Area = "Refunds and disputes",
                Status = TransformationStatus.Monitoring,
                Risk = "Legacy platform behaviours may not map one-to-one to the new provider.",
                Owner = "Operations",
                NextAction = "Capture reconciliation scenarios for the feature slice."
            });

        dbContext.WarehouseSignals.AddRange(
            new WarehouseSignal
            {
                WorkstreamId = "warehouse",
                SignalName = "Average pick-to-dispatch latency",
                CurrentValue = 46.5m,
                Unit = "minutes",
                Status = TransformationStatus.Monitoring,
                Opportunity = "Use event milestones to identify dispatch queue bottlenecks."
            });

        dbContext.HrPlatformTasks.AddRange(
            new HrPlatformTask
            {
                WorkstreamId = "hr-platform",
                TaskName = "Approval workflow inventory",
                Status = TransformationStatus.OnTrack,
                ProcessRisk = "Manual approvals may sit outside the first API boundary.",
                Owner = "People systems"
            });

        dbContext.InsightMetrics.AddRange(
            new InsightMetric
            {
                WorkstreamId = "insights",
                MetricName = "Streams with clear next action",
                Value = 5,
                Unit = "count",
                Status = TransformationStatus.OnTrack
            });

        dbContext.AutomationCandidates.AddRange(
            new AutomationCandidate
            {
                WorkstreamId = "automation",
                WorkflowName = "Manual exception triage",
                ValueScore = 8,
                EffortScore = 5,
                RiskClass = "Medium governance review",
                RecommendedNextStep = "Prototype human-approved recommendation flow before any model integration."
            });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureWorkflowReviewSchemaAsync(
        ModernisationDbContext dbContext,
        CancellationToken cancellationToken)
    {
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS "WorkflowReviews" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_WorkflowReviews" PRIMARY KEY AUTOINCREMENT,
                "Slice" TEXT NOT NULL,
                "RecordId" INTEGER NOT NULL,
                "Status" TEXT NOT NULL,
                "Action" TEXT NOT NULL,
                "Note" TEXT NOT NULL,
                "ReviewedBy" TEXT NOT NULL,
                "ReviewedAtUtc" TEXT NOT NULL
            );
            """,
            cancellationToken);

        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE INDEX IF NOT EXISTS "IX_WorkflowReviews_Slice_RecordId_Id"
            ON "WorkflowReviews" ("Slice", "RecordId", "Id");
            """,
            cancellationToken);
    }

    private static async Task EnsureAutomationGovernanceReviewSchemaAsync(
        ModernisationDbContext dbContext,
        CancellationToken cancellationToken)
    {
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS "AutomationGovernanceReviews" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_AutomationGovernanceReviews" PRIMARY KEY AUTOINCREMENT,
                "CandidateId" INTEGER NOT NULL,
                "TriageStatus" TEXT NOT NULL,
                "DataSensitivity" TEXT NOT NULL,
                "HumanApprovalRequired" INTEGER NOT NULL,
                "ModelRisk" TEXT NOT NULL,
                "ExpectedBenefit" TEXT NOT NULL,
                "EvidenceSource" TEXT NOT NULL,
                "ReviewedBy" TEXT NOT NULL,
                "ReviewedAtUtc" TEXT NOT NULL
            );
            """,
            cancellationToken);

        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE INDEX IF NOT EXISTS "IX_AutomationGovernanceReviews_CandidateId_Id"
            ON "AutomationGovernanceReviews" ("CandidateId", "Id");
            """,
            cancellationToken);
    }
}
