# Scaffold Notes

## C2 Outcome

This repo is intentionally one git repository containing both runtime areas:

- `frontend`: Nx Angular workspace managed with pnpm.
- `backend`: .NET solution with API, application, domain, infrastructure and test projects.

The scaffold keeps implementation surfaces small so later chunks can add persistence, package boundaries, API contracts and Docker without fighting early prototype noise.

## Next Chunk

C3 should replace placeholder workstream data with application services, domain entities, EF Core SQLite and deterministic seed data.
