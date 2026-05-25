# CI and Deployment Notes

## Continuous Integration

The GitHub Actions workflow at `.github/workflows/ci.yml` validates the prototype in three jobs:

- `Frontend`: installs the Angular workspace, runs lint, typecheck, production build and Playwright route smoke tests.
- `Backend`: restores, builds and tests the .NET solution.
- `Docker Images`: builds the frontend and backend container images after both code gates pass.

The workflow runs on pull requests, pushes to `main` and manual dispatches.

## Runtime Packaging

The local deployment package is the Docker Compose stack:

- `backend`: ASP.NET runtime image exposing the API on container port `8080` and host port `5029`.
- `frontend`: nginx image serving the Angular production build on container port `80` and host port `4200`.
- `backend-data`: named volume for SQLite state at `/data/modernisation.db`.

Frontend API configuration is loaded from `/assets/runtime-config.js`, so the browser-facing API URL can change without rebuilding Angular. The frontend image writes that file at container startup from:

- `LAR_FRONTEND_API_BASE_URL`, defaulting to `http://localhost:5029` for local Docker review;
- `LAR_FRONTEND_MOCK_API`, defaulting to `false`;
- `LAR_FRONTEND_ENVIRONMENT_LABEL`, defaulting to `Docker API mode`.

## Promotion Path

A production path would keep the same separation of concerns:

- publish the backend image to a registry and run it behind HTTPS;
- publish the frontend image or static assets to a web host/CDN;
- replace SQLite with managed relational storage;
- inject runtime API URL, CORS origins and database connection strings through environment-specific configuration;
- add identity, observability, secret management and deployment approvals before any real client data is used.

## Security Hardening Notes

The prototype now carries a visible baseline security posture:

- API requests under `/api` use ASP.NET fixed-window rate limiting.
- Rate-limit responses return `429` problem details with the current `correlationId`.
- CORS origins are explicit configuration in non-development environments.
- The Docker stack sets the local reviewer origin with `Cors__AllowedOrigins__0`.
- nginx sends `X-Content-Type-Options`, `Referrer-Policy` and a baseline `Content-Security-Policy`.

Recommended CI additions before production promotion:

- run `dotnet list package --vulnerable --include-transitive` for backend dependency review;
- run `pnpm --dir frontend audit` or an equivalent organisation-approved JS dependency scanner;
- scan built backend and frontend container images with a tool such as Trivy, Grype, Snyk or the organisation's registry scanner;
- publish scan results as CI artifacts and fail on agreed severity thresholds;
- keep CSP, CORS and rate-limit values environment-specific rather than hard-coded in application code.

## Local Release Check

Before sharing a build with reviewers:

```bash
pnpm verify
cd frontend
pnpm exec nx build transformation-console
cd ..
pnpm frontend:e2e
pnpm docker:build
```

If Playwright browsers are missing locally, run:

```bash
pnpm --dir frontend exec playwright install
```
