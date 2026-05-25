using LargeRetailer.Modernisation.Domain;
using Microsoft.EntityFrameworkCore;

namespace LargeRetailer.Modernisation.Infrastructure.Persistence;

public sealed class ModernisationDbContext(DbContextOptions<ModernisationDbContext> options) : DbContext(options)
{
    public DbSet<Workstream> Workstreams => Set<Workstream>();

    public DbSet<Initiative> Initiatives => Set<Initiative>();

    public DbSet<MigrationReadinessItem> MigrationReadinessItems => Set<MigrationReadinessItem>();

    public DbSet<WarehouseSignal> WarehouseSignals => Set<WarehouseSignal>();

    public DbSet<HrPlatformTask> HrPlatformTasks => Set<HrPlatformTask>();

    public DbSet<InsightMetric> InsightMetrics => Set<InsightMetric>();

    public DbSet<AutomationCandidate> AutomationCandidates => Set<AutomationCandidate>();

    public DbSet<AutomationGovernanceReview> AutomationGovernanceReviews => Set<AutomationGovernanceReview>();

    public DbSet<WorkflowReview> WorkflowReviews => Set<WorkflowReview>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Workstream>(entity =>
        {
            entity.HasKey(workstream => workstream.Id);
            entity.Property(workstream => workstream.Id).HasMaxLength(40);
            entity.Property(workstream => workstream.Name).HasMaxLength(120).IsRequired();
            entity.Property(workstream => workstream.Status).HasConversion<string>().HasMaxLength(24);
            entity.Property(workstream => workstream.Summary).HasMaxLength(500).IsRequired();
            entity.HasMany(workstream => workstream.Initiatives)
                .WithOne(initiative => initiative.Workstream)
                .HasForeignKey(initiative => initiative.WorkstreamId);
        });

        modelBuilder.Entity<Initiative>(entity =>
        {
            entity.Property(initiative => initiative.WorkstreamId).HasMaxLength(40);
            entity.Property(initiative => initiative.Name).HasMaxLength(160).IsRequired();
            entity.Property(initiative => initiative.Status).HasConversion<string>().HasMaxLength(24);
            entity.Property(initiative => initiative.Owner).HasMaxLength(100).IsRequired();
            entity.Property(initiative => initiative.NextAction).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<MigrationReadinessItem>(entity =>
        {
            entity.Property(item => item.WorkstreamId).HasMaxLength(40);
            entity.Property(item => item.Area).HasMaxLength(140).IsRequired();
            entity.Property(item => item.Status).HasConversion<string>().HasMaxLength(24);
            entity.Property(item => item.Risk).HasMaxLength(240).IsRequired();
            entity.Property(item => item.Owner).HasMaxLength(100).IsRequired();
            entity.Property(item => item.NextAction).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<WarehouseSignal>(entity =>
        {
            entity.Property(signal => signal.WorkstreamId).HasMaxLength(40);
            entity.Property(signal => signal.SignalName).HasMaxLength(140).IsRequired();
            entity.Property(signal => signal.Unit).HasMaxLength(40).IsRequired();
            entity.Property(signal => signal.Status).HasConversion<string>().HasMaxLength(24);
            entity.Property(signal => signal.Opportunity).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<HrPlatformTask>(entity =>
        {
            entity.Property(task => task.WorkstreamId).HasMaxLength(40);
            entity.Property(task => task.TaskName).HasMaxLength(160).IsRequired();
            entity.Property(task => task.Status).HasConversion<string>().HasMaxLength(24);
            entity.Property(task => task.ProcessRisk).HasMaxLength(240).IsRequired();
            entity.Property(task => task.Owner).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<InsightMetric>(entity =>
        {
            entity.Property(metric => metric.WorkstreamId).HasMaxLength(40);
            entity.Property(metric => metric.MetricName).HasMaxLength(160).IsRequired();
            entity.Property(metric => metric.Unit).HasMaxLength(40).IsRequired();
            entity.Property(metric => metric.Status).HasConversion<string>().HasMaxLength(24);
        });

        modelBuilder.Entity<AutomationCandidate>(entity =>
        {
            entity.Property(candidate => candidate.WorkstreamId).HasMaxLength(40);
            entity.Property(candidate => candidate.WorkflowName).HasMaxLength(160).IsRequired();
            entity.Property(candidate => candidate.RiskClass).HasMaxLength(80).IsRequired();
            entity.Property(candidate => candidate.RecommendedNextStep).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<AutomationGovernanceReview>(entity =>
        {
            entity.Property(review => review.TriageStatus).HasMaxLength(40).IsRequired();
            entity.Property(review => review.DataSensitivity).HasMaxLength(40).IsRequired();
            entity.Property(review => review.ModelRisk).HasMaxLength(40).IsRequired();
            entity.Property(review => review.ExpectedBenefit).HasMaxLength(400).IsRequired();
            entity.Property(review => review.EvidenceSource).HasMaxLength(300).IsRequired();
            entity.Property(review => review.ReviewedBy).HasMaxLength(100).IsRequired();
            entity.HasIndex(review => new { review.CandidateId, review.Id });
        });

        modelBuilder.Entity<WorkflowReview>(entity =>
        {
            entity.Property(review => review.Slice).HasMaxLength(40).IsRequired();
            entity.Property(review => review.Status).HasConversion<string>().HasMaxLength(24);
            entity.Property(review => review.Action).HasMaxLength(300).IsRequired();
            entity.Property(review => review.Note).HasMaxLength(1200).IsRequired();
            entity.Property(review => review.ReviewedBy).HasMaxLength(100).IsRequired();
            entity.HasIndex(review => new { review.Slice, review.RecordId, review.Id });
        });
    }
}
