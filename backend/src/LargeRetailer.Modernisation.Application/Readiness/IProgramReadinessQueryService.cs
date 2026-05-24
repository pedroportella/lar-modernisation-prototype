namespace LargeRetailer.Modernisation.Application.Readiness;

public interface IProgramReadinessQueryService
{
    Task<ProgramReadinessDto> GetAsync(CancellationToken cancellationToken);
}
