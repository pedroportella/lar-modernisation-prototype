using System.Diagnostics;

public static class CorrelationIds
{
    public const string HeaderName = "X-Correlation-ID";

    private const string ItemKey = "CorrelationId";

    public static string Current(HttpContext httpContext)
    {
        return httpContext.Items.TryGetValue(ItemKey, out var value) && value is string correlationId
            ? correlationId
            : Ensure(httpContext);
    }

    public static string Ensure(HttpContext httpContext)
    {
        var incoming = httpContext.Request.Headers[HeaderName].FirstOrDefault();
        var correlationId = string.IsNullOrWhiteSpace(incoming)
            ? Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N")
            : incoming.Trim();

        httpContext.Items[ItemKey] = correlationId;

        return correlationId;
    }
}
