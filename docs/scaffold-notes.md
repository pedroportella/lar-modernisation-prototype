# Scaffold Notes

## C2 Outcome

This repo is intentionally one git repository containing both runtime areas:

- `frontend`: Nx Angular workspace managed with pnpm.
- `backend`: .NET solution with API, application, domain, infrastructure and test projects.

The scaffold keeps implementation surfaces small so later chunks can add persistence, package boundaries, API contracts and Docker without fighting early prototype noise.

## C3 Outcome

The backend now has a real foundation:

- domain entities for workstreams, initiatives, readiness items, warehouse signals, HR tasks, insight metrics and automation candidates;
- an application query service that maps domain data to stable DTOs;
- EF Core SQLite persistence in the infrastructure layer;
- deterministic seed data created at API startup;
- `/health`, `/api/workstreams` and `/api/workstreams/{id}` endpoints;
- focused backend unit and integration tests.

## C4 Outcome

The frontend now has package boundaries and renders real backend data:

- `libs/services`: typed API client, DTOs and API base URL ownership;
- `libs/ui-assets`: neutral product/client labels and generic mark metadata;
- `libs/ui-library`: app shell, status pill and workstream card components;
- `libs/ui-tokens`: global CSS custom properties for surfaces, text, spacing, status colours and focus;
- `libs/utils`: pure status formatting and sorting helpers;
- routed dashboard surface that fetches `/api/workstreams` from the .NET API.

## C5 Outcome

The prototype now has five thin vertical feature slices:

- payment migration readiness;
- warehouse optimisation;
- HR platform uplift;
- wayfinding insights;
- automation opportunity queue.

Each slice has:

- a backend endpoint over seeded relational data;
- a typed method in `libs/services`;
- an Angular route and view;
- browser-smoke coverage against the running backend and frontend.

## C6 Outcome

The prototype can run as a two-container local stack:

- `backend`: .NET API published into an ASP.NET runtime image and exposed on host port `5029`;
- `frontend`: Angular production build served by nginx on host port `4200`;
- runtime frontend config points browser API calls at `http://localhost:5029`;
- SQLite persists in a named Docker volume at `/data/modernisation.db`.

## Next Chunk

C7 should tighten final quality gates, add final smoke evidence, and polish the reviewer runbook.
