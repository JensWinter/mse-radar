# Endpoint Structure

This document defines the URL structure for MSE Radar, covering both Astro web application pages and backend API endpoints. The structure is organized around the six bounded contexts identified in the domain analysis.

---

## Design Principles

1. **RESTful API Design**: API endpoints follow REST conventions with resource-based URLs and appropriate HTTP methods.
2. **Context-Based Organization**: URLs are grouped by bounded context for clarity and maintainability.
3. **Role-Based Access**: Endpoints enforce authorization based on user roles (Team Lead vs. Team Member).
4. **Privacy by Design**: API responses for results return only aggregated data; individual responses are only accessible to their submitters.
5. **Astro Conventions**: Page routes follow Astro's file-based routing with dynamic segments using `[param]` syntax.

---

## Astro Web Application Pages

### Root Route (Context-Aware)

| Route | Page | Description | Related Requirements |
|:------|:-----|:------------|:---------------------|
| `/` | Home / Dashboard | **Unauthenticated:** Landing page with sign-in/register options. **Authenticated:** Dashboard showing user's teams, recent activity, and open surveys. | 0006 |

### Public Pages (No Authentication Required)

| Route | Page | Description | Related Requirements |
|:------|:-----|:------------|:---------------------|
| `/register` | Registration | User registration form | 0001 |
| `/login` | Sign In | User authentication form | 0002 |

### Authenticated Pages (Require Sign-In)

#### Team Management

| Route                            | Page          | Description                                     | Related Requirements |
|:---------------------------------|:--------------|:------------------------------------------------|:---------------------|
| `/teams/new`                     | Create Team   | Form to create a new team                       | 0003                 |
| `/teams/[teamId]`                | Team Details  | View team information, members, and survey runs | 0003                 |
| `/teams/[teamId]/edit`           | Edit Team     | Edit team name and description (Team Lead only) | 0003                 |
| `/teams/[teamId]/members`        | Team Members  | View and manage team members (Team Lead only)   | 0004, 0005           |
| `/teams/[teamId]/members/invite` | Invite Member | Add a new team member (Team Lead only)          | 0004                 |

#### Survey Runs

| Route                                            | Page               | Description                                         | Related Requirements |
|:-------------------------------------------------|:-------------------|:----------------------------------------------------|:---------------------|
| `/teams/[teamId]/surveys`                        | Survey Runs List   | List of all survey runs for a team                  | 0008, 0010           |
| `/teams/[teamId]/surveys/new`                    | Create Survey Run  | Create a new survey run (Team Lead only)            | 0008                 |
| `/teams/[teamId]/surveys/[runId]`                | Survey Run Details | View survey run status, schedule, and participation | 0009, 0020, 0024     |
| `/teams/[teamId]/surveys/[runId]/respond`        | Answer Survey      | Survey response form for team members               | 0011, 0021           |
| `/teams/[teamId]/surveys/[runId]/my-response`    | My Response        | View/edit own submitted response                    | 0011                 |
| `/teams/[teamId]/surveys/[runId]/results`        | Survey Results     | View aggregated results and DORA capability profile | 0015, 0016, 0025     |
| `/teams/[teamId]/surveys/[runId]/results/export` | Export Results     | Export results in various formats                   | 0026                 |
| `/teams/[teamId]/surveys/[runId]/workshop`       | Workshop View      | Presentation-friendly view for team discussions     | 0027                 |

#### Trends & Analysis

| Route                    | Page       | Description                                       | Related Requirements |
|:-------------------------|:-----------|:--------------------------------------------------|:---------------------|
| `/teams/[teamId]/trends` | Trend View | Compare DORA capability scores across survey runs | 0018                 |

#### Survey Models

| Route                      | Page                 | Description                                      | Related Requirements |
|:---------------------------|:---------------------|:-------------------------------------------------|:---------------------|
| `/survey-models`           | Survey Models List   | List of available survey model versions          | 0007, 0022           |
| `/survey-models/[version]` | Survey Model Details | View survey model with questions and capabilities | 0007, 0022           |

#### DORA Capabilities & Guidance

| Route                                         | Page                       | Description                                 | Related Requirements |
|:----------------------------------------------|:---------------------------|:--------------------------------------------|:---------------------|
| `/dora-capabilities`                          | DORA Capabilities Overview | List of all DORA capabilities               | 0007, 0019           |
| `/dora-capabilities/[doraCapabilityId]`       | DORA Capability Details    | Drill-down explanation of a DORA capability | 0019                 |
| `/teams/[teamId]/guidance`                    | Team Guidance              | Tailored improvement guidance for the team  | 0017, 0030           |
| `/teams/[teamId]/guidance/[doraCapabilityId]` | DORA Capability Guidance   | Specific guidance for one DORA capability   | 0017                 |

#### Account & Settings

| Route               | Page             | Description             | Related Requirements |
|:--------------------|:-----------------|:------------------------|:---------------------|
| `/account`          | Account Settings | User account management | 0001, 0002           |
| `/account/password` | Change Password  | Password change form    | 0002                 |

#### Future Pages (Could Have)

| Route                | Page              | Description                     | Related Requirements |
|:---------------------|:------------------|:--------------------------------|:---------------------|
| `/chat`              | Chat Assistant    | LLM-powered DORA capability Q&A | 0031                 |
| `/settings/language` | Language Settings | Multi-language UI selection     | 0033                 |

---

## Backend API Endpoints

### Identity & Access Context

Authentication and user management endpoints.

| Method | Endpoint | Description | Related Requirements |
|:-------|:---------|:------------|:---------------------|
| `POST` | `/api/auth/register` | Register a new user account | 0001 |
| `POST` | `/api/auth/login` | Authenticate user and create session | 0002 |
| `POST` | `/api/auth/logout` | End user session | 0002 |
| `GET` | `/api/auth/me` | Get current authenticated user | 0002 |
| `PATCH` | `/api/auth/password` | Change user password | 0002 |
| `POST` | `/api/auth/sso/[provider]` | SSO authentication (future) | 0034 |

### Team Management Context

Team and membership management endpoints.

| Method   | Endpoint                                    | Description                 | Related Requirements |
|:---------|:--------------------------------------------|:----------------------------|:---------------------|
| `GET`    | `/api/teams`                                | List teams for current user | 0006                 |
| `POST`   | `/api/teams`                                | Create a new team           | 0003                 |
| `GET`    | `/api/teams/[teamId]`                       | Get team details            | 0003                 |
| `PATCH`  | `/api/teams/[teamId]`                       | Update team details         | 0003                 |
| `DELETE` | `/api/teams/[teamId]`                       | Delete a team (future)      | -                    |
| `GET`    | `/api/teams/[teamId]/members`               | List team members           | 0003, 0004           |
| `POST`   | `/api/teams/[teamId]/members`               | Add a team member           | 0004                 |
| `DELETE` | `/api/teams/[teamId]/members/[userId]`      | Remove a team member        | 0004                 |
| `PATCH`  | `/api/teams/[teamId]/members/[userId]/role` | Change member role          | 0005                 |

### Survey Definition Context

DORA Capability API endpoints. Survey models are accessed via Astro pages (see [Survey Models](#survey-models) in the pages section).

| Method | Endpoint                                    | Description                                | Related Requirements |
|:-------|:--------------------------------------------|:-------------------------------------------|:---------------------|
| `GET`  | `/api/dora-capabilities`                    | List all DORA capabilities                 | 0007                 |
| `GET`  | `/api/dora-capabilities/[doraCapabilityId]` | Get DORA capability details and drill-down | 0007, 0019           |

### Survey Execution Context

Survey run lifecycle and response management endpoints.

| Method | Endpoint | Description | Related Requirements |
|:-------|:---------|:------------|:---------------------|
| `GET` | `/api/teams/[teamId]/survey-runs` | List survey runs for a team | 0008, 0010 |
| `POST` | `/api/teams/[teamId]/survey-runs` | Create a new survey run | 0008 |
| `GET` | `/api/teams/[teamId]/survey-runs/[runId]` | Get survey run details | 0008 |
| `PATCH` | `/api/teams/[teamId]/survey-runs/[runId]` | Update survey run (schedule, etc.) | 0020 |
| `POST` | `/api/teams/[teamId]/survey-runs/[runId]/open` | Open survey run for responses | 0009 |
| `POST` | `/api/teams/[teamId]/survey-runs/[runId]/close` | Close survey run | 0009 |
| `POST` | `/api/teams/[teamId]/survey-runs/[runId]/reopen` | Reopen a closed survey run | 0009 |
| `GET` | `/api/teams/[teamId]/survey-runs/[runId]/participation` | Get participation stats | 0024 |
| `POST` | `/api/teams/[teamId]/survey-runs/[runId]/responses` | Submit survey response | 0011, 0012, 0013, 0014, 0021 |
| `GET` | `/api/teams/[teamId]/survey-runs/[runId]/responses/mine` | Get current user's response | 0011, 0023 |
| `PUT` | `/api/teams/[teamId]/survey-runs/[runId]/responses/mine` | Update current user's response | 0011 |

### Assessment & Insights Context

Results, scoring, and analytics endpoints.

| Method | Endpoint                                                          | Description                            | Related Requirements |
|:-------|:------------------------------------------------------------------|:---------------------------------------|:---------------------|
| `GET`  | `/api/teams/[teamId]/survey-runs/[runId]/results`                 | Get aggregated results                 | 0015, 0016           |
| `GET`  | `/api/teams/[teamId]/survey-runs/[runId]/results/scores`          | Get DORA capability scores             | 0015                 |
| `GET`  | `/api/teams/[teamId]/survey-runs/[runId]/results/confidence`      | Get confidence/variance data           | 0025                 |
| `GET`  | `/api/teams/[teamId]/survey-runs/[runId]/results/export`          | Export results (CSV/JSON/PDF)          | 0026                 |
| `GET`  | `/api/teams/[teamId]/trends`                                      | Get trend data across survey runs      | 0018                 |
| `GET`  | `/api/teams/[teamId]/trends/dora-capabilities/[doraCapabilityId]` | Get trend for specific DORA capability | 0018                 |

### Improvement Guidance Context

Recommendations and guidance endpoints.

| Method | Endpoint                                                            | Description                               | Related Requirements |
|:-------|:--------------------------------------------------------------------|:------------------------------------------|:---------------------|
| `GET`  | `/api/teams/[teamId]/guidance`                                      | Get tailored guidance for team            | 0017                 |
| `GET`  | `/api/teams/[teamId]/guidance/dora-capabilities/[doraCapabilityId]` | Get guidance for specific DORA capability | 0017                 |
| `GET`  | `/api/teams/[teamId]/suggestions`                                   | Get next-best improvement suggestions     | 0030                 |
| `GET`  | `/api/dora-capabilities/[doraCapabilityId]/guidance`                | Get general guidance content              | 0017                 |
| `POST` | `/api/chat`                                                         | Chat assistant query (future)             | 0031                 |

### Notifications Context (Future)

| Method | Endpoint | Description | Related Requirements |
|:-------|:---------|:------------|:---------------------|
| `GET` | `/api/notifications` | Get user notifications | 0028 |
| `PATCH` | `/api/notifications/[id]/read` | Mark notification as read | 0028 |
| `GET` | `/api/teams/[teamId]/notification-settings` | Get team notification settings | 0028 |
| `PATCH` | `/api/teams/[teamId]/notification-settings` | Update notification settings | 0028 |

---

## URL Design Decisions

### 1. Team-Centric Resource Hierarchy

Most resources are nested under teams (`/api/teams/[teamId]/...`) because:
- Survey runs belong to teams (Req 0008)
- Results are team-level and protected by team membership (Req 0013, 0016)
- Guidance is tailored to team's assessed levels (Req 0017)

### 2. Survey Runs as Central Resource

Survey runs serve as the anchor for responses and results:
- Responses are submitted to a specific run (Req 0011)
- Results are computed per run (Req 0015)
- Runs are isolated from each other (Req 0010)

### 3. Separate Action Endpoints for Lifecycle

Survey run lifecycle actions use dedicated endpoints (`/open`, `/close`, `/reopen`) rather than PATCH with status because:
- Actions are explicit and auditable
- Server-side validation is clearer
- Aligns with domain events in the bounded context

### 4. Privacy-Preserving Response Access

Response endpoints are designed to enforce privacy:
- `/responses/mine` - Only returns the authenticated user's response (Req 0023)
- No endpoint to list all responses individually
- Results endpoints return only aggregated data (Req 0015, 0016)

### 5. DORA Capability Routes at Root Level

DORA Capabilities are accessible at `/api/dora-capabilities` (not team-nested) because:
- DORA capabilities are global, not team-specific (Req 0007)
- Drill-down content is shared across teams (Req 0019)
- Team-specific guidance references these global definitions

### 6. Trends as Separate Resource

Trends are at `/api/teams/[teamId]/trends` rather than nested under survey runs because:
- Trends span multiple survey runs (Req 0018)
- Easier to query aggregated data across time

---

## Requirements Coverage Matrix

| Req ID | Priority | Requirement                       | Pages                                            | API Endpoints                                            |
|:-------|:--------:|:----------------------------------|:-------------------------------------------------|:---------------------------------------------------------|
| 0001   |    M     | Register user                     | `/register`                                      | `/api/auth/register`                                     |
| 0002   |    M     | Authenticate users                | `/login`                                         | `/api/auth/login`, `/logout`, `/me`                      |
| 0003   |    M     | Create and manage teams           | `/teams/*`                                       | `/api/teams/*`                                           |
| 0004   |    M     | Authorize team members            | `/teams/[teamId]/members/*`                      | `/api/teams/[teamId]/members/*`                          |
| 0005   |    M     | Assign roles                      | `/teams/[teamId]/members`                        | `/api/teams/[teamId]/members/[userId]/role`              |
| 0006   |    M     | Role-based administration         | `/dashboard`, `/teams`                           | `/api/teams`                                             |
| 0007   |    M     | DORA capabilities survey          | `/survey-models/*`, `/dora-capabilities/*`       | `/api/dora-capabilities/*`, `/api/survey-models/*`       |
| 0008   |    M     | Create survey run                 | `/teams/[teamId]/surveys/new`                    | `/api/teams/[teamId]/survey-runs`                        |
| 0009   |    M     | Open and close survey run         | `/teams/[teamId]/surveys/[runId]`                | `/api/.../survey-runs/[runId]/open`, `/close`, `/reopen` |
| 0010   |    M     | Keep survey runs separate         | `/teams/[teamId]/surveys`                        | `/api/teams/[teamId]/survey-runs`                        |
| 0011   |    M     | Answer a survey                   | `/teams/[teamId]/surveys/[runId]/respond`        | `/api/.../survey-runs/[runId]/responses/*`               |
| 0012   |    M     | Prevent responses outside state   | -                                                | `/api/.../survey-runs/[runId]/responses` (validation)    |
| 0013   |    M     | Prevent non-member responses      | -                                                | `/api/.../survey-runs/[runId]/responses` (authorization) |
| 0014   |    M     | Store responses with audit        | -                                                | `/api/.../survey-runs/[runId]/responses` (server-side)   |
| 0015   |    M     | Calculate DORA capability scores  | `/teams/[teamId]/surveys/[runId]/results`        | `/api/.../survey-runs/[runId]/results/scores`            |
| 0016   |    M     | Visualize DORA capability profile | `/teams/[teamId]/surveys/[runId]/results`        | `/api/.../survey-runs/[runId]/results`                   |
| 0017   |    M     | Tailored improvement guidance     | `/teams/[teamId]/guidance/*`                     | `/api/teams/[teamId]/guidance/*`                         |
| 0018   |    S     | Trend view                        | `/teams/[teamId]/trends`                         | `/api/teams/[teamId]/trends/*`                           |
| 0019   |    S     | DORA Capability drill-down        | `/dora-capabilities/[doraCapabilityId]`          | `/api/dora-capabilities/[doraCapabilityId]`              |
| 0020   |    S     | Schedule survey run               | `/teams/[teamId]/surveys/[runId]`                | `/api/.../survey-runs/[runId]` (PATCH)                   |
| 0021   |    S     | Add comments to answers           | `/teams/[teamId]/surveys/[runId]/respond`        | `/api/.../survey-runs/[runId]/responses`                 |
| 0022   |    S     | Question versioning               | -                                                | `/api/survey-models/[version]`                           |
| 0023   |    S     | Pseudonymous responses            | -                                                | `/api/.../responses/mine` (privacy)                      |
| 0024   |    C     | Participation tracking            | `/teams/[teamId]/surveys/[runId]`                | `/api/.../survey-runs/[runId]/participation`             |
| 0025   |    C     | Confidence indicators             | `/teams/[teamId]/surveys/[runId]/results`        | `/api/.../survey-runs/[runId]/results/confidence`        |
| 0026   |    C     | Export results                    | `/teams/[teamId]/surveys/[runId]/results/export` | `/api/.../survey-runs/[runId]/results/export`            |
| 0027   |    C     | Workshop view                     | `/teams/[teamId]/surveys/[runId]/workshop`       | `/api/.../survey-runs/[runId]/results`                   |
| 0028   |    C     | Notifications                     | -                                                | `/api/notifications/*`                                   |
| 0029   |    C     | Customizable survey               | -                                                | (Survey model customization - TBD)                       |
| 0030   |    C     | Next-best improvements            | `/teams/[teamId]/guidance`                       | `/api/teams/[teamId]/suggestions`                        |
| 0031   |    C     | Chat assistant                    | `/chat`                                          | `/api/chat`                                              |
| 0032   |    C     | Integration with tools            | -                                                | (External integrations - TBD)                            |
| 0033   |    C     | Multi-language UI                 | `/settings/language`                             | (i18n routing)                                           |
| 0034   |    C     | SSO authentication                | `/login`                                         | `/api/auth/sso/[provider]`                               |

---

## References

- [Requirements](requirements.md)
- [Bounded Contexts](bounded_contexts.md)
- [Architecture Vision](architecture_vision.md)
- [User Story Map](user_story_map.md)
