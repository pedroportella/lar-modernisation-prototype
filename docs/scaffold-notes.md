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

## Next Chunk

C4 should create the frontend packages, wire the services API client, and render dashboard data from the .NET API instead of local Angular placeholder data.
