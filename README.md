# MSE Radar

Team capability assessment via DORA-based surveys — measure, track, and improve your software engineering practices.

## Overview

MSE Radar helps software development teams assess their engineering capabilities against DORA research standards. Teams take periodic surveys, see aggregated results visualized as capability profiles, and receive tailored improvement guidance grounded in DORA metrics.

## Features

- **User authentication** — email/password login, extensible to SSO
- **Team management** — create teams, invite members, assign roles (Team Lead / Team Member)
- **DORA-based survey model** — structured surveys covering the four key DORA capabilities
- **Survey lifecycle** — create, open, and close survey
- **Capability scoring** — calculate and visualize current capability profiles
- **Improvement guidance** — tailored, actionable recommendations per capability
- **Trend tracking** — compare results across surveys over time

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Astro 5, Alpine.js, TailwindCSS 4, DaisyUI 5 |
| Backend | Astro API routes (Node runtime) |
| Database | SQLite (better-sqlite3) |
| Auth | better-auth |
| Language | TypeScript |
| Runtime | Deno (scripts & tests), npm (Astro app) |
| Testing | Playwright (acceptance), Vitest (unit) |

## Getting Started

**Prerequisites:** Deno, Node.js / npm

```bash
# Install dependencies
cd astro && npm install && cd ..

# Set up environment
cp .env.sample .env

# Set up database
deno task db:migrate
deno task db:seed

# Start dev server → http://localhost:4321
deno task run:astro:dev
```

## Project Structure

```
mse-radar/
├── astro/              # Web application (pages, components, services, API routes)
├── acceptance/         # ATDD acceptance tests (Deno + Playwright)
├── deno_scripts/       # Database migration & seed scripts
├── db/migrations/      # SQL schema
└── docs/               # Architecture, requirements, API specs
```

## Testing

```bash
deno task test:acceptance    # Acceptance tests (ATDD / Four Layer Model)
deno task test:astro:unit    # Unit & component tests (Vitest)
deno task test:astro:e2e     # End-to-end tests (Playwright)
```

## Documentation

| Document                                              | Description                                     |
|-------------------------------------------------------|-------------------------------------------------|
| [Architecture](docs/agents/architecture.md)           | DDD bounded contexts, patterns, database design |
| [Testing](docs/agents/testing.md)                     | Four Layer Model ATDD, unit testing conventions |
| [Project Structure](docs/agents/project-structure.md) | Directory layout, file organization             |
| [Requirements](docs/requirements.md)                  | Full feature list with MoSCoW prioritization    |
| [Architecture Vision](docs/architecture_vision.md)    | Arc42 architecture document                     |
| [API Endpoints](docs/endpoints.md)                    | API endpoint specifications                     |
