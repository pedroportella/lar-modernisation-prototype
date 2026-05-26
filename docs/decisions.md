# Decisions

## One Repository For Frontend And Backend

The prototype uses one git repository for the Angular frontend and .NET backend. This keeps review, CI, Docker Compose and cross-stack changes in one place while still preserving native workspace boundaries under `frontend` and `backend`.

## Angular/Nx Uses `apps` And `libs`

The frontend uses Nx-style `apps` and `libs` folders because this is the expected Angular workspace language and it makes reuse boundaries visible to reviewers.

`apps/transformation-console` owns application composition: routes, page wiring, runtime providers and feature orchestration. It should stay thin enough that a second Angular app could reuse the same lower-level building blocks without copying route-local code.

The `libs` folder is intentionally split by reusable responsibility:

- `libs/services` owns typed DTOs, API methods and request/response contracts. Components consume methods from this library rather than hand-building HTTP URLs.
- `libs/ui-library` owns reusable shell, layout and UI components that can be shared across dashboard, readiness, feature-slice and operations routes.
- `libs/ui-tokens` owns design tokens and visual constants so repeated spacing, colour and typography decisions do not drift between pages.
- `libs/ui-assets` owns neutral brand metadata and asset-facing structures that are separate from component logic.
- `libs/utils` owns small pure helpers that are safe to reuse across app and library code.

This keeps the prototype closer to a maintainable Angular application than a single-app demo. It also gives future work a clear place to add reusable services, table adapters, form helpers or design-system wrappers without turning feature routes into duplicated implementation islands.

## Runtime API Configuration

The Angular build does not bake in a fixed API URL. Runtime config is served from `/assets/runtime-config.js`, so Docker and local development can point at different backend hosts without rebuilding the frontend image. The same config also carries a short environment label for the shell, making mock mode and API-backed mode visible to reviewers.

The generated `runtime-config.js` file is not the source of truth. The repository keeps a default mock-mode copy so a fresh checkout has a browser-readable fallback, but local development uses `.env.local`, GitHub Actions uses explicit `LAR_FRONTEND_*` environment variables, and Docker uses container environment variables. Each path writes the browser-readable runtime config before serving the app. CI pins that generation to frontend mock mode so smoke tests stay deterministic without a live backend.

## Layered .NET API

The backend separates API, application, domain and infrastructure projects. That is intentionally more structured than a single minimal API file because the interview scenario is about modernisation judgement, not only endpoint mechanics.

## SQLite Seed Data

SQLite gives the prototype a real persistence boundary while remaining easy to run locally and in Docker. Seed data makes demos deterministic and keeps integration tests stable.

## Derived Readiness Surface

The readiness page and `/api/program/readiness` endpoint derive score, signals and recommended actions from workstream and initiative data. This gives the prototype an executive-facing view without pretending to integrate with real enterprise systems.

## CI On Current GitHub Actions Runtimes

The workflow uses current action major versions and relies on `packageManager` for pnpm version selection. That avoids duplicate pnpm declarations and Node.js 20 deprecation warnings in GitHub Actions.

## Prototype Boundaries

Payment provider integration, warehouse feeds, HRIS feeds, analytics feeds, model-provider calls, enterprise identity, PCI controls and cloud deployment are simulated. They are called out as boundaries rather than hidden behind optimistic naming.

## Govern Automation Before Model-Provider Integration

The automation slice stores governance review events before introducing any model provider. That keeps model risk, data sensitivity, human approval and evidence/source decisions explicit, reviewable and testable.

## Azure Blueprint Instead Of Live Cloud

The repository includes an Azure deployment blueprint rather than active infrastructure-as-code. That keeps the prototype reviewable on any laptop while still showing how the current Docker, runtime config, health, security and observability boundaries would map to Azure services.
