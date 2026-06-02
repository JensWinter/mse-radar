Feature: 0009-002 Close survey run
  As a team lead
  I want to close a survey run
  So that responses stop and results are available

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"

  Scenario: Stop accepting responses when the survey run is closed
    When I close the survey run for team "Road Runners"
    Then the survey run status is "closed"
    And the survey run is closed
    And I cannot answer the survey

  Scenario: Members see a clear message when submitting to a closed survey
    Given I close the survey run for team "Road Runners"
    When I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    Then the survey run is closed

  Scenario: Aggregated capability scores are shown once the run is closed
    Given I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey
    When I sign in as "pete@example.com"
    And I close the survey run for team "Road Runners"
    Then the assessment results are displayed
    And the capability scores are displayed

  Scenario: Regular team members cannot close a survey run
    Given I sign in as "murat@example.com"
    When I navigate to the survey run page for team "Road Runners"
    Then I cannot close the survey run
