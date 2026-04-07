# AGENTS.md

MSE Radar: Team capability assessment via DORA-based surveys. Astro (SSR), TypeScript, SQLite, DaisyUI/TailwindCSS.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

## Quick Start

```bash
deno task db:migrate && deno task db:seed     # Setup database
deno task run:astro:dev                       # Dev server (http://localhost:4321)
deno task test:acceptance                     # Run acceptance tests
deno task test:astro:unit                     # Run unit tests
```

**Tech stack:** Deno (root tasks, scripts, tests) + npm (Astro app in `astro/` directory)

## Detailed Guides

- [Architecture](docs/agents/architecture.md) - DDD bounded contexts, patterns, database design
- [Testing](docs/agents/testing.md) - Four Layer Model ATDD, unit testing conventions
- [Project Structure](docs/agents/project-structure.md) - Directory layout, file organization

## Plan Mode Instructions
When asked to create a plan, or when in plan mode, follow these rules:
- Make plans extremely concise. Sacrifice grammar for concision.
- End each plan with a list of unresolved questions that need answers before implementation
