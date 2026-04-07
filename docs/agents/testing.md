# Testing Guidelines

## Acceptance Tests (ATDD)

**Four Layer Model:** Test Cases → DSL → Protocol Drivers → SUT

- **Style:** BDD with Given/When/Then
- **DSL classes** correspond to bounded contexts (e.g., `IdentityAndAccessDsl`, `TeamManagementDsl`)
- **Location:** `acceptance/tests/`

**Run all acceptance tests:**
```bash
deno task test:acceptance
```

**Run single spec:**
```bash
deno test --env-file=.env.acceptance --allow-all acceptance/tests/0001-001-user-registration.spec.ts
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
  ├── tests/        # Test cases (Given/When/Then)
  ├── dsl/          # Domain-Specific Language layer
  ├── drivers/      # Protocol drivers
  └── sut/          # System Under Test setup
```
