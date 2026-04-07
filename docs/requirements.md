# Requirements

| ID   | Prio | Title                                                            | Description                                                                                                                                                                         |
|:-----|:----:|:-----------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0001 |  M   | Register user                                                    | Users can create an account in the application to access its features.                                                                                                              |
| 0002 |  M   | Authenticate users                                               | Users can sign in to the application so participation and management actions can be securely tied to an identity.                                                                   |
| 0003 |  M   | Create and manage teams                                          | The system allows creating a team and managing its basic details so that survey runs and results can be associated with a specific team.                                            |
| 0004 |  M   | Authorize team members                                           | Team leads can specify persons to be authorized as team members so they can answer surveys for that team.                                                                           |
| 0005 |  M   | Assign roles                                                     | The system supports at least two roles: team lead (can manage survey runs) and team member (can answer surveys and view results).                                                   |
| 0006 |  M   | Role-based administration for multiple teams                     | A user can participate in multiple teams, potentially as a team lead in one team and a team member in another.                                                                      |
| 0007 |  M   | Define a DORA capabilities-based survey model                    | The application provides a structured survey based on DORA capabilities to assess a team’s software engineering skills.                                                             |
| 0008 |  M   | Create a survey run for a team                                   | Team leads can create a new survey run (assessment cycle) for a team so that the survey can be repeated over time.                                                                  |
| 0009 |  M   | Open and close a survey run                                      | Team leads can open a survey run to accept responses and close it to stop collecting responses and enable final analysis.                                                           |
| 0010 |  M   | Keep survey runs separate across time                            | Results and responses from different survey runs are isolated so that repeated assessments across a project lifecycle do not overwrite each other.                                  |
| 0011 |  M   | Answer a survey                                                  | Team members can submit responses to the currently open survey run for their team. Submitted responses can be edited until the survey run is closed.                                |
| 0012 |  M   | Prevent responses outside the allowed state                      | The system blocks responses when a survey run is not open and provides a clear user message.                                                                                        |
| 0013 |  M   | Prevent responses from non-team members                          | The system blocks responses from users who are not authorized team members and provides a clear user message.                                                                       |
| 0014 |  M   | Store survey responses with audit context                        | Survey responses are persisted with at least timestamp, survey run identifier, and respondent identifier (or a privacy-preserving equivalent) to support analysis and traceability. |
| 0015 |  M   | Calculate capability scores from responses                       | The system computes per-capability scores (and overall summaries) from collected responses using a defined scoring method.                                                          |
| 0016 |  M   | Visualize current capability profile for a team                  | Team members can view a visualization of the team’s current (i.e. latest survey run) capability scores.                                                                             |
| 0017 |  M   | Provide tailored improvement guidance per capability             | For each capability, the application presents actionable guidance grounded in DORA research, tailored to the team’s assessed level.                                                 |
| 0018 |  S   | Compare results between survey runs (trend view)                 | Team members can compare capability scores across survey runs to understand progress over time.                                                                                     |
| 0019 |  S   | Provide capability drill-down explanations                       | Users can open details for a capability to understand what it measures and why it matters.                                                                                          |
| 0020 |  S   | Schedule a survey run                                            | Team leads can schedule open/close times for a survey run in advance.                                                                                                               |
| 0021 |  S   | Add comments to survey answers                                   | Respondents can optionally add free-text comments per question/capability to provide context to numeric selections.                                                                 |
| 0022 |  S   | Question versioning                                              | Changes to the survey question set are versioned so older survey runs remain interpretable even if the survey evolves.                                                              |
| 0023 |  S   | Support pseudonymous responses within a team                     | The system hides individual respondent identity while still ensuring one response per member per survey run.                                                                        |
| 0024 |  C   | Show participation and response completeness                     | Team members can see how many team members have responded and how complete the responses are for an open or closed survey run.                                                      |
| 0025 |  C   | Confidence indicators and disagreement visualization             | The system shows distribution/variance across responses to help teams identify misalignment and areas requiring discussion.                                                         |
| 0026 |  C   | Export results                                                   | Team members can export aggregated results (e.g., CSV/JSON/PDF) to use in workshops and reporting.                                                                                  |
| 0027 |  C   | Facilitate a team workshop view                                  | The application provides a presentation-friendly view of aggregated results and suggested discussion prompts for a team session.                                                    |
| 0028 |  C   | Notification when a survey run opens/closes                      | Team members receive notifications when a survey run is opened and reminders before it closes.                                                                                      |
| 0029 |  C   | Customizable survey                                              | Team leads can tailor the survey by enabling/disabling certain capabilities or adding a small number of team-specific questions.                                                    |
| 0030 |  C   | Suggestions for next-best improvements                           | Based on scores and confidence signals, the system recommends a short list of high-impact improvement actions.                                                                      |
| 0031 |  C   | Basic LLM chat assistant                                         | The application includes a chat interface that can answer questions about capabilities and link the user to relevant guidance content.                                              |
| 0032 |  C   | Integration with project tools                                   | The system can connect to external tools to enrich context (e.g., link guidance tasks to a backlog).                                                                                |
| 0033 |  C   | Multi-language UI                                                | The application supports multiple languages for the user interface and guidance content.                                                                                            |
| 0034 |  C   | SSO / enterprise authentication options                          | The system supports optional sign-in via providers such as Google, Microsoft, or SAML/OIDC for organizations.                                                                       |
| 0035 |  W   | Fully automated capability assessment from engineering telemetry | The system will not attempt to replace surveys with automatic scoring solely from engineering tool telemetry in the initial releases.                                               |
| 0036 |  W   | Cross-organization benchmarking and leaderboards                 | The system will not provide public or cross-organization comparisons between teams (e.g., leaderboards) in the initial releases.                                                    |
| 0037 |  W   | Automated performance management features                        | The system will not provide individual performance evaluation features; it remains focused on team-level improvement.                                                               |
| 0038 |  W   | Fine-grained permissions                                         | Teams cannot configure additional roles or permissions (e.g., coach/facilitator) for viewing results and managing survey runs.                                                      |

## Glossary

| Term | Description                                                                                                                                                      |
|:-----|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Authorization | Granting a user access to a specific team and its survey runs/results (i.e., being an authorized team member).                                                   |
| Authentication | Proving a user's identity when signing in (e.g., email/password in the initial release).                                                                         |
| Capability | A DORA-defined engineering capability that is assessed by the survey (in this project: typically one capability corresponds to one survey question).             |
| Capability drill-down | Detailed view for a capability explaining what it measures, how it is scored, and why it matters.                                                                |
| Capability score / profile | The computed numeric result per capability (and the set of all such scores for a team), derived from survey responses.                                           |
| DORA capabilities | The capability set defined by DORA (see https://dora.dev/capabilities/) that forms the basis of the survey model and guidance content.                           |
| Guidance | Actionable improvement advice presented per capability, grounded in DORA research and tailored to the assessed level.                                            |
| Last-write-wins | When multiple submissions exist for the same person and survey run, the most recent submission overrides earlier ones.                                           |
| Likert scale (1–7) | The numeric answer format for survey questions in this project.                                                                                                  |
| Pseudonymity (within a team) | Individual identities are hidden from other team members while still enforcing at most one effective response per member per survey run; results are aggregated. |
| Response | A team member's submitted answers for a survey run; may include optional free-text comments (when supported).                                                    |
| Result (aggregated) | The team-level computed scores and summaries shown after a survey run is closed (not raw individual responses).                                                  |
| Role | A permission set assigned to a user in a team. At minimum: team lead and team member.                                                                            |
| Survey | The questionnaire used to assess a team's capabilities.                                                                                                          |
| Survey model | The structure and content of the survey (capabilities/questions, scales, versions) that enables consistent assessment.                                           |
| Survey run | A concrete execution instance (assessment cycle) of the survey for a specific team, with its own open/close timeframe and collected responses.                   |
| Team | A group of people assessed together; survey runs, responses, and results are associated with a team.                                                             |
| Team lead | A team member with additional permissions to manage the team, authorize members, and manage survey runs.                                                         |
| Team member | A user authorized for a team who can answer surveys and view their team's results.                                                                               |
| Question versioning | Tracking changes to the survey question set over time so older survey runs remain interpretable.                                                                 |

## Hints

- Team leads are also team members. They can answer surveys for their team.
- Raw individual responses are only ever visible to the team members who submitted them. No team member or team lead can see the raw responses of another team member.
- Pseudonymity: No one can see who answered what. (Exception: respondents can see their own responses) Responses will be aggregated.
- "Audit context" requires storing identifiers that could re-identify people. These identifiers should be protected and only accessible to authorized system components.
- DORA capabilities are defined in https://dora.dev/capabilities/.
- Survey questions should be defined as a Likert Scale (1-7)
- There can not be more than one open survey run at a time per team.
- A survey run can be reopened. Answers can be edited after submission.
- "Basic details" of a team include at least: team name, description, creation date, team lead(s), and member list.
- One person can be in multiple teams. Identity is global (e.g., used for authentication).
- Answers are saved individually per question (auto-save on selection). Each save uses last-write-wins, meaning the most recent value for a question overrides the previous one.
- "Basic privacy and data access rules" means
  - only the person who submitted a response can see it
  - only team members can see their team's results (pseudonymous and/or aggregated)
  - only team leads can manage survey runs
- Any authenticated user can create a team. The user becomes the team lead. So each team has at least one team lead.
- Registration/Authentication with email and password is sufficient for the initial release.
- Team leads can change team member roles. There must always be at least one team lead.
- One DORA capability = One question in a survey.
- Team members can see planned/scheduled survey runs.
- Survey runs cannot be scheduled with overlapping times.
- Usually team leads cannot see more than team members. They just have the additional role to manage surveys runs and team members.
- Survey results become visible after the survey run is closed.
- Cross-Cutting requirement to protect sensitive team information.
  - Access to survey results and responses is restricted to team members.
  - Team members can only see their own responses. All other responses are pseudonymous.

## Open issues

- Account lifecycle and team administration: Remove member, change role, deactivate user, delete team, transfer team ownership.
- Supported question types (Likert Scale, NPS, multiple choice, free text)
- Data retention & compliance
  - No explicit retention periods, deletion/export on request, audit log requirements.
  - Whether data is encrypted at rest/in transit (might be non-functional requirements).
- Configuration of survey questions
- Scoring method and computation of overall summaries aren’t defined yet
- Comparability across time: How to compare results from different survey runs? And with survey versions?
