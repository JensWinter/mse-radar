# Project Structure

## Top-Level Directories

```
astro/          - Web application (Astro framework)
acceptance/     - ATDD tests (Four Layer Model)
db/migrations/  - SQL migration files
deno_scripts/   - Scripts (database management)
docs/            - Architecture docs, requirements, user stories, agents info
```

## Astro Application (`astro/`)

```
astro/src/
  ├── pages/           # Routes and API endpoints
  ├── components/      # UI components
  ├── services/        # Business logic (each has .test.ts)
  ├── database/        # Repository pattern implementations
  ├── models/
  │   └── aggregates/  # Domain models
  ├── middleware/      # Auth middleware
  └── actions/         # Astro server actions
```

## Acceptance Tests (`acceptance/`)

```
acceptance/
  ├── tests/     # Test cases (Given/When/Then)
  ├── dsl/       # Domain-Specific Language layer
  ├── drivers/   # Protocol drivers
  └── sut/       # System Under Test setup
```

## Agent Docs (`docs/agents/`)

```
docs/agents/
  ├── architecture.md         # Architecture guide
  ├── testing.md              # Testing guide
  └── project-structure.md    # This file
```
