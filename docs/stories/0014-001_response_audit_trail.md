# Story 0014-001: Response Audit Trail
**Estimate:** M

**Narrative:** As a team member I want my responses to be stored with proper context so that the system can track when responses were submitted and ensure data integrity.

**Acceptance Criteria:**
- Given I save an answer, when it is stored, then the submission timestamp is updated (last-write-wins).
- Given I submit a response, when it is stored, then the survey run identifier is recorded.
- Given I submit a response, when it is stored, then a respondent identifier is recorded in a privacy-preserving way.
- Given I view my own response, when I check the details, then I can see when I submitted it.
- Given audit information is stored, when another team member views results, then they cannot see who submitted which response.
