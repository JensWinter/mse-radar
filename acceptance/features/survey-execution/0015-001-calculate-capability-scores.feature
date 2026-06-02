Feature: 0015-001 Calculate capability scores
  As a team member
  I want aggregated DORA capability scores from a closed survey run
  So that I can see the team's maturity

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And a registered user with email "laura@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I add "laura@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"

  Scenario: A score is shown for each DORA capability of a closed run
    Given I navigate to the survey run page for team "Road Runners"
    And I answer the survey
    And I close the survey run for team "Road Runners"
    When I view the assessment results for team "Road Runners"
    Then the assessment results are displayed
    And the capability scores are displayed

  Scenario: Each capability score reflects the aggregated responses
    Given I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "5,5,5,5,5,5,5,5,5,5"
    And I sign in as "laura@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "3,3,3,3,3,3,3,3,3,3"
    And I sign in as "pete@example.com"
    And I close the survey run for team "Road Runners"
    When I view the assessment results for team "Road Runners"
    Then the assessment results are displayed
    And the total response count is 2
    And the aggregated score for capability "Continuous Integration" is 4.0

  Scenario: An overall summary of the team's capabilities is displayed
    Given I navigate to the survey run page for team "Road Runners"
    And I answer the survey
    And I close the survey run for team "Road Runners"
    When I view the assessment results for team "Road Runners"
    Then the assessment results are displayed
    And an overall summary is displayed

  Scenario: Only aggregated results are shown, not individual responses
    Given I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "3,4,5,4,5,3,4,5,4,5"
    And I sign in as "laura@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "5,4,5,4,3,5,4,5,4,3"
    And I sign in as "pete@example.com"
    And I close the survey run for team "Road Runners"
    When I view the assessment results for team "Road Runners"
    Then the assessment results are displayed
    And individual responses are not visible
