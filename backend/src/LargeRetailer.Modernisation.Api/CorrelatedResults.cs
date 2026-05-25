public static class CorrelatedResults
{
    public static IResult Problem(HttpContext httpContext, string detail, int statusCode)
    {
        var correlationId = CorrelationIds.Current(httpContext);

        return Results.Problem(
            detail,
            statusCode: statusCode,
            extensions: new Dictionary<string, object?>
            {
                ["correlationId"] = correlationId
            });
    }

    public static IResult ValidationProblem(
        HttpContext httpContext,
        IReadOnlyDictionary<string, string[]> errors)
    {
        var correlationId = CorrelationIds.Current(httpContext);

        return Results.ValidationProblem(
            errors,
            extensions: new Dictionary<string, object?>
            {
                ["correlationId"] = correlationId
            });
    }
}
