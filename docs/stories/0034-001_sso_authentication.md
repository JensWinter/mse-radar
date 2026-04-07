# Story 0034-001: SSO Authentication
**Estimate:** L

**Narrative:** As a user in an organization I want to sign in using my corporate identity provider so that I can access the application without creating a separate account.

**Acceptance Criteria:**
- Given my organization uses a supported identity provider, when I sign in, then I can authenticate using my corporate credentials.
- Given I sign in via SSO, when authentication succeeds, then I have access to the same features as email/password users.
- Given multiple authentication options are available, when I access the sign-in page, then I can choose between email/password and SSO.
- Given I sign in via SSO for the first time, when authentication succeeds, then my account is created automatically based on my identity provider information.
