Feature: 0011-002 Edit survey response
  As a team member
  I want to edit my survey response while the run is open
  So that only my latest answers count

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"

  Scenario: Editing replaces previous answers while the survey is open
    Given I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "1,2,3,4,5,4,3,1,2"
    And I navigate to the survey run page for team "Road Runners"
    When I answer the survey with "5,4,3,2,1,2,1,5,4"
    And I navigate to the survey run page for team "Road Runners"
    Then my answers are "5,4,3,2,1,2,1,5,4"

  Scenario: Only the most recent submission is used when the survey closes
    Given I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "1,1,1,1,1,1,1,1,1"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "4,4,4,4,4,4,4,4,4"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "5,5,5,5,5,5,5,5,5"
    When I sign in as "pete@example.com"
    And I close the survey run for team "Road Runners"
    And I view the assessment results for team "Road Runners"
    Then the total response count is 1

  Scenario: Clear message when trying to edit after the survey is closed
    Given I navigate to the survey run page for team "Road Runners"
    And I answer the survey
    And I close the survey run for team "Road Runners"
    When I navigate to the survey run page for team "Road Runners"
    Then the survey run is closed

  Scenario: Updated answers are displayed when viewing the submission after an edit
    Given I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "1,2,3,null,5,4,3,null,1"
    And I navigate to the survey run page for team "Road Runners"
    When I answer the survey with "5,4,3,2,1,2,1,null,5"
    And I navigate to the survey run page for team "Road Runners"
    Then my answers are "5,4,3,2,1,2,1,null,5"
