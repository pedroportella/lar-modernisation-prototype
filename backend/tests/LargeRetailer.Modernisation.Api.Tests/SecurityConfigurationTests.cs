using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;

namespace LargeRetailer.Modernisation.Api.Tests;

public sealed class SecurityConfigurationTests
{
    [Fact]
    public void Cors_origins_are_explicit_in_production_configuration()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cors:AllowedOrigins:0"] = "https://review.example.test"
            })
            .Build();

        var origins = FrontendCorsOrigins.From(configuration, new TestEnvironment("Production"));

        Assert.Equal(["https://review.example.test"], origins);
    }

    [Fact]
    public void Cors_origins_fall_back_to_localhost_only_in_development()
    {
        var configuration = new ConfigurationBuilder().Build();

        var origins = FrontendCorsOrigins.From(configuration, new TestEnvironment("Development"));

        Assert.Contains("http://localhost:4200", origins);
        Assert.Contains("http://127.0.0.1:4300", origins);
    }

    [Fact]
    public void Cors_origins_are_closed_when_production_configuration_is_missing()
    {
        var configuration = new ConfigurationBuilder().Build();

        var origins = FrontendCorsOrigins.From(configuration, new TestEnvironment("Production"));

        Assert.Empty(origins);
    }

    [Fact]
    public void Nginx_configuration_sets_baseline_security_headers()
    {
        var nginxConfig = File.ReadAllText(FindRepositoryFile("frontend/docker/nginx.conf"));

        Assert.Contains("X-Content-Type-Options", nginxConfig);
        Assert.Contains("nosniff", nginxConfig);
        Assert.Contains("Referrer-Policy", nginxConfig);
        Assert.Contains("strict-origin-when-cross-origin", nginxConfig);
        Assert.Contains("Content-Security-Policy", nginxConfig);
        Assert.Contains("frame-ancestors 'none'", nginxConfig);
    }

    private static string FindRepositoryFile(string relativePath)
    {
        var directory = new DirectoryInfo(Directory.GetCurrentDirectory());

        while (directory is not null)
        {
            var candidate = Path.Combine(directory.FullName, relativePath);

            if (File.Exists(candidate))
            {
                return candidate;
            }

            directory = directory.Parent;
        }

        throw new FileNotFoundException($"Could not find {relativePath} from the test working directory.");
    }

    private sealed class TestEnvironment(string environmentName) : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = environmentName;

        public string ApplicationName { get; set; } = "LargeRetailer.Modernisation.Api.Tests";

        public string WebRootPath { get; set; } = Directory.GetCurrentDirectory();

        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();

        public string ContentRootPath { get; set; } = Directory.GetCurrentDirectory();

        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
