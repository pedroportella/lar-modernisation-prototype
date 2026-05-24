using LargeRetailer.Modernisation.Application.Features;
using LargeRetailer.Modernisation.Application.Workstreams;
using LargeRetailer.Modernisation.Infrastructure.Features;
using LargeRetailer.Modernisation.Infrastructure.Persistence;
using LargeRetailer.Modernisation.Infrastructure.Workstreams;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LargeRetailer.Modernisation.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("ModernisationDb")
            ?? "Data Source=modernisation.db";

        services.AddDbContext<ModernisationDbContext>(options => options.UseSqlite(connectionString));
        services.AddScoped<IFeatureSliceRepository, EfFeatureSliceRepository>();
        services.AddScoped<IWorkstreamRepository, EfWorkstreamRepository>();

        return services;
    }
}
