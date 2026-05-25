# Reviewer Runbook

This prototype is one git repository with an Angular/Nx frontend and a layered .NET API backend.

The runbook is written for a technical reviewer. It should help you verify how the work is structured, how to run it locally, which quality gates pass and where the production boundaries are.

## Quick Orientation

- Frontend app: `frontend/apps/transformation-console`
- Frontend libraries: `frontend/libs`
- Backend API: `backend/src/LargeRetailer.Modernisation.Api`
- Backend tests: `backend/tests`
- Docker runtime: `docker-compose.yml`
- CI workflow: `.github/workflows/ci.yml`

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

The frontend smoke suite regenerates browser runtime config from local `.env.local` through `pnpm config:local`. GitHub Actions does the same from CI environment variables and pins smoke tests to `mockApi: true`, so the route checks do not require a live backend.

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
- `GET http://localhost:5029/health/ready` returns `Ready`.
- `GET http://localhost:5029/api/operations/status` returns SQLite status and seeded data counts.
- `GET http://localhost:5029/api/program/readiness` returns delivery posture, score and recommended actions.
- `GET http://localhost:5029/api/workstreams` returns seeded workstreams.
- `GET http://localhost:4200/assets/runtime-config.js` points at `http://localhost:5029`, sets `mockApi: false` and labels the shell `Docker API mode`.
- `http://localhost:4200/automation` renders `Opportunity Queue` with one or more table rows.
- `http://localhost:4200/readiness` renders `Delivery Readiness`.
- `http://localhost:4200/operations` renders `Runtime Status`.
- The app does not show `Unable to reach the backend API.`

For workflow persistence, open `Payments`, update `Token migration` in the `Status review` workflow, save, then reload the page. In Docker or local backend mode, the latest review is loaded from `GET /api/workflow-reviews/payments/1` and should still appear. In frontend mock mode, the same form is useful for UI smoke testing but a hard reload resets to fixture data.

## Five-Minute Demo Path

Use this path when walking a reviewer through the prototype:

1. Start at `http://localhost:4200/` and show the portfolio view of seeded workstreams.
2. Open `Readiness` to show the derived program score, signals and recommended next actions.
3. Open `Payments` and `Warehouse` to show thin vertical slices over the same backend data shape.
4. Open `Automation` to show prioritised operational triage and the backend governance contract for candidate review.
5. Open `Operations` last to show runtime readiness, SQLite reachability and seeded data counts.

## Reviewer Notes

- The client is intentionally anonymised as a large Australian retailer.
- External integrations are simulated through seeded SQLite data.
- Docker persists SQLite in the `backend-data` named volume.
- Runtime frontend API configuration is intentionally outside the compiled Angular bundle so Docker/local API targets can be changed without rebuilding.
- `frontend/apps/transformation-console/public/assets/runtime-config.js` is generated browser config. Change `.env.local`, Docker environment variables or CI `LAR_FRONTEND_*` variables rather than editing it as source.
- The Docker frontend container writes runtime config from `LAR_FRONTEND_API_BASE_URL`, `LAR_FRONTEND_MOCK_API` and `LAR_FRONTEND_ENVIRONMENT_LABEL` when nginx starts.
- Architecture and decision notes live in `docs/architecture.md` and `docs/decisions.md`.
- CI and deployment packaging notes live in `docs/ci-deployment-notes.md`.
- Automation/model-provider work is intentionally limited to a governance-ready backend contract. There are no external provider calls in this prototype.
