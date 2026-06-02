Feature: 0009-001 Open survey run
  As a team lead
  I want to open a survey run
  So that team members can submit responses

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"

  Scenario: Accept responses when the survey run is opened
    When I open the survey run for team "Road Runners"
    Then the survey run status is "open"
    And the survey run for team "Road Runners" accepts responses

  Scenario: Team member submits responses to an open survey run
    Given I open the survey run for team "Road Runners"
    And I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    When I answer the survey
    Then my response is saved for team "Road Runners"

  Scenario: Cannot open another survey run while one is already open
    Given I open the survey run for team "Road Runners"
    When I navigate to the survey run page for team "Road Runners"
    Then I cannot open the survey run

  Scenario: Team members cannot open a survey run
    When I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    Then I cannot open the survey run
