var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularDev", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "http://localhost:4300")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AngularDev");

var workstreams = new[]
{
    new WorkstreamDto("payments", "Payment migration", "Scaffolded", "Stripe-style adapter boundary reserved for C5."),
    new WorkstreamDto("warehouse", "Warehouse optimisation", "Scaffolded", "Operational signal endpoints reserved for C5."),
    new WorkstreamDto("hr-platform", "HR platform uplift", "Scaffolded", "Roadmap and integration task endpoints reserved for C5."),
    new WorkstreamDto("insights", "Wayfinding insights", "Scaffolded", "Decision-support metric endpoints reserved for C5."),
    new WorkstreamDto("automation", "Automation opportunity queue", "Scaffolded", "AI governance and recommendation boundary reserved for C5."),
};

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "LargeRetailer.Modernisation.Api" }))
    .WithName("Health");

app.MapGet("/api/workstreams", () => Results.Ok(workstreams))
    .WithName("GetWorkstreams");

app.MapGet("/api/workstreams/{id}", (string id) =>
    workstreams.FirstOrDefault(workstream => workstream.Id == id) is { } workstream
        ? Results.Ok(workstream)
        : Results.NotFound())
    .WithName("GetWorkstreamById");

app.Run();

record WorkstreamDto(string Id, string Name, string Status, string Summary);
