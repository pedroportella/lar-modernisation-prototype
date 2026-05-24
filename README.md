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
- API endpoints for workstreams and five feature slices.
- Operations status endpoint and route for runtime readiness and seeded data counts.
- Docker Compose runtime with frontend and backend containers.
- GitHub Actions CI workflow for frontend, backend and Docker image gates.
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

Full stack with Docker:

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:4200
- Backend health: http://localhost:5029/health

## Verify

Standard gate:

```bash
pnpm verify
```

Frontend production build:

```bash
cd frontend
pnpm exec nx build transformation-console
```

Full gate including Docker image build:

```bash
pnpm verify:full
```

Frontend-only checks:

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm --dir frontend exec playwright install
pnpm frontend:e2e
```

Backend-only checks:

```bash
pnpm backend:build
pnpm backend:test
```

Docker:

```bash
docker compose build
docker compose up
```

See [docs/reviewer-runbook.md](docs/reviewer-runbook.md) for the reviewer smoke checklist and handover notes.
See [docs/ci-deployment-notes.md](docs/ci-deployment-notes.md) for CI and deployment packaging notes.

## What Is Real

- Runnable Angular app scaffold.
- Frontend package boundaries for services, UI assets, UI library, UI tokens and utils.
- Dashboard workstream data loaded from the .NET API through `libs/services`.
- Feature routes for payments, warehouse, HR uplift, insights and automation.
- Operations route for API readiness, SQLite status and seeded dataset counts.
- Docker Compose stack for local full-stack review.
- GitHub Actions workflow that validates frontend, backend and Docker packaging.
- Runnable .NET API with layered project structure.
- EF Core SQLite database created locally at API startup.
- Seeded workstream and initiative data served through application services.
- Backend unit and integration tests.

## API Surface

```text
GET /health
GET /health/live
GET /health/ready
GET /api/operations/status
GET /api/workstreams
GET /api/workstreams/{id}
GET /api/payments/migration-readiness
GET /api/warehouse/optimisation
GET /api/hr/platform-uplift
GET /api/insights/wayfinding
GET /api/automation/candidates
```

## What Is Simulated

- Payment provider integration.
- Warehouse, HRIS and analytics feeds.
- AI/model calls.
- Enterprise identity, PCI controls and cloud deployment.

Those boundaries are reserved for later chunks and should be named honestly when implemented.
