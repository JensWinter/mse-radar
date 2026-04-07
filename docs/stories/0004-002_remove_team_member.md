# Story 0004-002: Remove Team Member
**Estimate:** S

**Narrative:** As a team lead I want to remove members from my team so that former team members no longer have access to team surveys and results.

**Acceptance Criteria:**
- Given I am a team lead, when I remove a team member, then they no longer have access to the team.
- Given a member has been removed, when they sign in, then the team no longer appears in their list of teams.
- Given I am not a team lead, when I try to remove a member from a team, then I cannot remove them.
- Given I try to remove the last team lead, when I submit the request, then I see a clear message that there must be at least one team lead.
