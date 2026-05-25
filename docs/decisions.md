# Decisions

## One Repository For Frontend And Backend

The prototype uses one git repository for the Angular frontend and .NET backend. This keeps review, CI, Docker Compose and cross-stack changes in one place while still preserving native workspace boundaries under `frontend` and `backend`.

## Angular/Nx Uses `apps` And `libs`

The frontend uses Nx-style `apps` and `libs` folders. Shared Angular code lives in `libs`, not `packages`, because `libs` is the expected Angular/Nx workspace language and gives reviewers a clearer signal than mirroring Next.js conventions.

## Runtime API Configuration

The Angular build does not bake in a fixed API URL. Runtime config is served from `/assets/runtime-config.js`, so Docker and local development can point at different backend hosts without rebuilding the frontend image.

## Layered .NET API

The backend separates API, application, domain and infrastructure projects. That is intentionally more structured than a single minimal API file because the interview scenario is about modernisation judgement, not only endpoint mechanics.

## SQLite Seed Data

SQLite gives the prototype a real persistence boundary while remaining easy to run locally and in Docker. Seed data makes demos deterministic and keeps integration tests stable.

## Derived Readiness Surface

The readiness page and `/api/program/readiness` endpoint derive score, signals and recommended actions from workstream and initiative data. This gives the prototype an executive-facing view without pretending to integrate with real enterprise systems.

## CI On Current GitHub Actions Runtimes

The workflow uses current action major versions and relies on `packageManager` for pnpm version selection. That avoids duplicate pnpm declarations and Node.js 20 deprecation warnings in GitHub Actions.

## Prototype Boundaries

Payment provider integration, warehouse feeds, HRIS feeds, analytics feeds, AI calls, enterprise identity, PCI controls and cloud deployment are simulated. They are called out as boundaries rather than hidden behind optimistic naming.
