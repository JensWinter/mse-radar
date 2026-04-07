# Story 0013-001: Block Non-Member Responses
**Estimate:** S

**Narrative:** As a team lead, I want only authorized team members to submit responses so that survey results accurately reflect my team's assessment.

**Acceptance Criteria:**
- Given I am not a member of a team, when I try to submit responses to their survey, then I see a clear message that I am not authorized.
- Given I am a member of a team, when I submit responses to our survey, then my submission is accepted.
- Given I was removed from a team, when I try to submit responses to their survey, then I see a clear message that I am not authorized.
- Given I try to access a survey for a team I don't belong to, when I view the page, then I am denied access.
