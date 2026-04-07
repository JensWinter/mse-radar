# Story 0012-001: Block Responses When Survey Not Open
**Estimate:** S

**Narrative:** As a team member, I want to receive clear feedback when I cannot submit a response so that I understand why my submission is not accepted.

**Acceptance Criteria:**
- Given a survey run is in pending state, when I try to submit a response, then I see a clear message that the survey is not yet open.
- Given a survey run is closed, when I try to submit a response, then I see a clear message that the survey is closed.
- Given there is no survey run for my team, when I try to submit a response, then I see a clear message that no survey is available.
- Given a survey run is open, when I submit a response, then my submission is accepted without error.
