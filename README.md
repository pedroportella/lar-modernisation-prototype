# Large Australian Retailer Modernisation Prototype

Working scaffold for an interview prototype: an Angular transformation console backed by a .NET API.

The client framing is intentionally neutral. The prototype demonstrates delivery judgement for a large Australian retailer modernisation program without naming or copying a real client.

## Repository Shape

```text
lar-modernisation-prototype/
  frontend/   Nx Angular workspace
  backend/    .NET solution and layered projects
  docs/       handover notes for reviewers
```

## Current Scope

- Angular/Nx workspace under `frontend`.
- .NET solution under `backend`.
- Angular app shell, routed dashboard and frontend packages.
- EF Core SQLite persistence with deterministic seed data.
- API endpoints: `/health`, `/api/workstreams`, `/api/workstreams/{id}`.
- One git repository at this folder root for both frontend and backend.

## Run Locally

Frontend:

```bash
cd frontend
pnpm exec nx serve transformation-console
```

Backend:

```bash
dotnet run --project backend/src/LargeRetailer.Modernisation.Api
```

## Verify

Frontend:

```bash
cd frontend
pnpm nx build transformation-console
pnpm exec tsc -p apps/transformation-console/tsconfig.app.json --noEmit
```

Backend:

```bash
dotnet build backend/LargeRetailer.Modernisation.sln
dotnet test backend/LargeRetailer.Modernisation.sln
```

## What Is Real

- Runnable Angular app scaffold.
- Frontend package boundaries for services, UI assets, UI library, UI tokens and utils.
- Dashboard workstream data loaded from the .NET API through `libs/services`.
- Runnable .NET API with layered project structure.
- EF Core SQLite database created locally at API startup.
- Seeded workstream and initiative data served through application services.
- Backend unit and integration tests.

## What Is Simulated

- Payment provider integration.
- Warehouse, HRIS and analytics feeds.
- AI/model calls.
- Enterprise identity, PCI controls and cloud deployment.

Those boundaries are reserved for later chunks and should be named honestly when implemented.
