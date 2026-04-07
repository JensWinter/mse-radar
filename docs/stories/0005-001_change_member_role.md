# Story 0005-001: Change Team Member Role
**Estimate:** M

**Narrative:** As a team lead I want to change a team member's role so that I can grant or revoke administrative permissions within the team.

**Acceptance Criteria:**
- Given I am a team lead, when I promote a team member to team lead, then they gain permissions to manage team members and survey runs.
- Given I am a team lead, when I change a team lead to a team member, then they lose administrative permissions but can still participate in surveys.
- Given I try to demote the last team lead, when I submit the request, then I see a clear message that there must be at least one team lead.
- Given I am not a team lead, when I try to change a team member's role, then I cannot change their role.
