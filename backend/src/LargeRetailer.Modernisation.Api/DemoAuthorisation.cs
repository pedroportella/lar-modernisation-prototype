using Microsoft.Extensions.Primitives;

public enum DemoRole
{
    Viewer,
    DeliveryLead,
    Admin
}

public static class DemoAuthorisation
{
    public const string HeaderName = "X-LAR-DEMO-ROLE";

    public static bool CanWriteWorkflowReviews(HttpContext httpContext)
    {
        return TryReadRole(httpContext, out DemoRole role)
            && role is DemoRole.DeliveryLead or DemoRole.Admin;
    }

    private static bool TryReadRole(HttpContext httpContext, out DemoRole role)
    {
        role = DemoRole.Viewer;

        if (!httpContext.Request.Headers.TryGetValue(HeaderName, out StringValues roleValues))
        {
            return false;
        }

        string? rawRole = roleValues.FirstOrDefault();

        return Enum.TryParse(rawRole, ignoreCase: true, out role);
    }
}
