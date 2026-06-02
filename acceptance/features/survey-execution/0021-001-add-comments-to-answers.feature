Feature: 0021-001 Add comments to answers
  As a team member
  I want to add an optional comment to a question
  So that I can give context that stays private from aggregated results

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"

  Scenario: Add an optional comment when answering a question
    Given I navigate to the survey run page for team "Road Runners"
    When I add the comment "We improved a lot recently" to capability "Continuous integration"
    Then the comment for capability "Continuous integration" is saved

  Scenario: Display own comment when viewing my submission
    Given I navigate to the survey run page for team "Road Runners"
    And I add the comment "This area needs more attention" to capability "Continuous integration"
    When I navigate to the survey run page for team "Road Runners"
    Then my comment for capability "Continuous integration" is "This area needs more attention"

  Scenario: Individual comments are not shown in aggregated team results
    Given I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey
    And I add the comment "Confidential team feedback 12345" to capability "Continuous integration"
    When I sign in as "pete@example.com"
    And I close the survey run for team "Road Runners"
    And I view the assessment results for team "Road Runners"
    Then the comment "Confidential team feedback 12345" is not shown in the results
