Feature: 0009-003 Reopen survey run
  As a team lead
  I want to reopen a closed survey run
  So that members can submit or edit responses again

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"

  Scenario: Accept responses again when the survey run is reopened
    Given I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    And I close the survey run for team "Road Runners"
    When I reopen the survey run for team "Road Runners"
    Then the survey run status is "open"
    And the survey run for team "Road Runners" accepts responses

  Scenario: Members can edit previous responses after a reopen
    Given I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    And I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "3,3,3,3,3,3,3,3,3,3"
    And I sign in as "pete@example.com"
    And I close the survey run for team "Road Runners"
    And I reopen the survey run for team "Road Runners"
    And I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    When I answer the survey with "5,5,5,5,5,5,5,5,5,5"
    Then my response with answers "5,5,5,5,5,5,5,5,5,5" is saved for team "Road Runners"

  Scenario: Cannot reopen a survey run that is already open
    Given I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    When I navigate to the survey run page for team "Road Runners"
    Then I cannot reopen the survey run

  Scenario: Regular team members cannot reopen a survey run
    Given I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    And I close the survey run for team "Road Runners"
    And I sign in as "murat@example.com"
    When I navigate to the survey run page for team "Road Runners"
    Then I cannot reopen the survey run
