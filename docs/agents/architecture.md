# Architecture

## Domain-Driven Design

**6 Bounded Contexts:**
1. **Identity & Access** - User auth, sessions
2. **Team Management** - Teams, membership, roles
3. **Survey Definition** - DORA capabilities, questions
4. **Survey Execution** - Survey runs, response collection
5. **Assessment & Insights** - Score calculation, visualization
6. **Improvement Guidance** - Recommendations

## Key Patterns

- **Server-first rendering** with islands for interactivity (Alpine.js)
- **Repository pattern** for data access
- **Service layer** for business logic
- **Acceptance Test Driven Development** (Four Layer Model from Dave Farley's Modern Software Engineering)

## Database Design

- PostgreSQL; `survey_responses.answer_values` and `answer_comments` stored as BYTEA ciphertext (see Encryption at rest below)
- Last-write-wins strategy for multiple submissions

## Encryption at rest

Survey response values and comments are encrypted with AES-256-GCM before insert/update and decrypted on load.

- Key: `RESPONSE_ENCRYPTION_KEY` env var, 32 bytes base64-encoded
- Threat model: **database administrators** (Postgres/backup access) — they see ciphertext only, cannot learn who rated which capability. The application operator is trusted.
- `respondent_id` stays plaintext — participation is not private, only rating values are.
- Out of scope: key rotation (future: versioned key ID column), hardware-backed key storage (KMS/Vault).
- Losing the key makes all existing responses unreadable; leaking it to someone with DB access breaks the guarantee.

## Reference Documentation

- `docs/architecture_vision.md` - Architectural vision and principles (as Arc42 documentation)
- `docs/bounded_contexts.md` - DDD contexts & ubiquitous language
- `docs/requirements.md` - Prioritized requirements
- `docs/project_vision.md` - Vision and goals
- `docs/user_story_map.md` - Story map
- `docs/endpoints.md` - API endpoints
- `docs/ui_standards.md` - UI standards and guidelines
- `docs/implementation_plan.md` - Delivery plan
