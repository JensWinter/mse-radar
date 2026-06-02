Feature: 0017-001 Tailored improvement guidance
  As a team member
  I want guidance tailored to each capability's assessed level
  So that I know how to improve

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    And I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "4,4,4,4,4,4,4,4,4,4"
    And I sign in as "pete@example.com"
    And I close the survey run for team "Road Runners"

  Scenario: Show guidance for a specific capability from closed results
    Given I sign in as "murat@example.com"
    And I view the assessment results for team "Road Runners"
    When I access the guidance for capability "Code maintainability"
    Then the guidance for capability "Code maintainability" is displayed

  Scenario: Guidance is tailored to the assessed capability level
    Given I sign in as "murat@example.com"
    And I view the assessment results for team "Road Runners"
    When I access the guidance for capability "Code maintainability"
    Then the guidance text is:
      """
      Expand maintainability practices across more of the organization’s codebase rather than relying on team-specific habits. Standardize dependency update processes so teams can consume known-good versions and respond quickly when vulnerabilities are patched. Strengthen tooling that shows which services are affected by a dependency or code change before it reaches production. Track metrics such as searchable code coverage, dependency version age, upgrade frequency, and lead time for cross-team changes.
      """

  Scenario: Guidance shows actionable advice and its DORA source
    Given I sign in as "murat@example.com"
    And I view the assessment results for team "Road Runners"
    When I access the guidance for capability "Code maintainability"
    Then the guidance contains actionable advice
    And the guidance shows its DORA source
