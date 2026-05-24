# Reviewer Runbook

This prototype is one git repository with an Angular/Nx frontend and a layered .NET API backend.

## Quick Orientation

- Frontend app: `frontend/apps/transformation-console`
- Frontend libraries: `frontend/libs`
- Backend API: `backend/src/LargeRetailer.Modernisation.Api`
- Backend tests: `backend/tests`
- Docker runtime: `docker-compose.yml`

## Quality Gates

Run the standard verification gate from the repository root:

```bash
pnpm verify
```

That runs:

- Angular lint for `transformation-console`
- Angular app typecheck
- .NET backend tests without restore, MSBuild node reuse or parallel MSBuild workers

Run the Angular production build from the frontend workspace:

```bash
cd frontend
pnpm exec nx build transformation-console
```

For the Docker image gate:

```bash
pnpm verify:full
```

For frontend smoke coverage with mocked API responses:

```bash
pnpm --dir frontend exec playwright install
pnpm frontend:e2e
```

## Local Runtime

Run frontend and backend separately:

```bash
pnpm frontend:dev
pnpm backend:dev
```

Or run the full Docker stack:

```bash
pnpm docker:up
```

Open:

- Frontend: http://localhost:4200
- Backend health: http://localhost:5029/health

When finished:

```bash
pnpm docker:down
```

## Manual Smoke Checklist

With the Docker stack running, verify:

- `GET http://localhost:5029/health` returns `Healthy`.
- `GET http://localhost:5029/api/workstreams` returns seeded workstreams.
- `GET http://localhost:4200/assets/runtime-config.js` points at `http://localhost:5029`.
- `http://localhost:4200/automation` renders `Opportunity Queue` with one or more table rows.
- The app does not show `Unable to reach the backend API.`

## Reviewer Notes

- The client is intentionally anonymised as a large Australian retailer.
- External integrations are simulated through seeded SQLite data.
- Docker persists SQLite in the `backend-data` named volume.
- Runtime frontend API configuration is intentionally outside the compiled Angular bundle so Docker/local API targets can be changed without rebuilding.
