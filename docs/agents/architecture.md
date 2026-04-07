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

- SQLite with JSON arrays for answer values
- Last-write-wins strategy for multiple submissions

## Reference Documentation

- `docs/architecture_vision.md` - Architectural vision and principles (as Arc42 documentation)
- `docs/bounded_contexts.md` - DDD contexts & ubiquitous language
- `docs/requirements.md` - Prioritized requirements
- `docs/project_vision.md` - Vision and goals
- `docs/user_story_map.md` - Story map
- `docs/endpoints.md` - API endpoints
- `docs/ui_standards.md` - UI standards and guidelines
- `docs/implementation_plan.md` - Delivery plan
