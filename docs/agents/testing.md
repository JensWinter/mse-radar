# Testing Guidelines

## Acceptance Tests (ATDD)

**Four Layer Model:** Test Cases (classic Gherkin `.feature` files) → DSL → Protocol Drivers → SUT

- **Test-case layer** = `.feature` files + step definitions. Steps are thin wrappers over the DSL — **no logic in steps**.
- **DSL classes** correspond to bounded contexts (e.g., `IdentityAndAccessDsl`, `TeamManagementDsl`).

**Layout:**
```
acceptance/features/
  <bounded-context>/NNNN-NNN-title.feature    # one feature per story
  steps/<bounded-context>.steps.ts            # one steps file per bounded context
  support/world.ts                            # custom World exposing the shared Dsl
  support/hooks.ts                            # Before/After/BeforeAll/AfterAll (SUT + browser)
acceptance/cucumber.json                      # default profile (runs all features) and "single" profile (for running one feature)
acceptance/runAllFeatures.ts                  # managed-mode orchestrator
```

**Run all acceptance tests:**
```bash
deno task test:acceptance
```

**Parallel execution:** Cucumber runs scenarios in parallel workers against one shared DB/SUT (started once by `runAllFeatures.ts`, passed via env) with no per-test reset. Each scenario gets a unique token; the DSL namespaces every email/team/survey identifier with it. Write plain literals in `.feature` files and route all identifiers through the DSL.

**Run a single feature:** (standalone mode self-starts the SUT). Use `--profile single` — it omits `paths` so the feature-path argument controls selection:
```bash
deno run -A --env-file=.env.acceptance npm:@cucumber/cucumber@^11 \
  --config acceptance/cucumber.json --profile single \
  acceptance/features/identity-and-access/0001-001-user-registration.feature
```

## Unit Tests

**Convention:** Located next to the code they test
- `service.ts` → `service.test.ts`

**Deno tests** (for `deno_scripts/`):
```bash
deno task test:unit                           # All tests
deno test deno_scripts/db/migrate.test.ts     # Single file
```

**Astro component tests** (Vitest):
```bash
deno task test:astro:unit                     # All tests
cd astro && npm run test -- src/services/users-service.test.ts  # Single file
```

## Test Structure

```
acceptance/
  ├── features/     # Gherkin test cases (.feature) + steps/ + support/
  ├── dsl/          # Domain-Specific Language layer
  ├── drivers/      # Protocol drivers
  └── sut/          # System Under Test setup
```
