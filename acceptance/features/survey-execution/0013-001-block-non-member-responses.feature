Feature: 0013-001 Block non-member responses
  As the system
  I want only current team members to access a team's survey
  So that responses come from authorized members only

  Scenario: Deny a non-member trying to respond to a survey
    Given a registered user with email "pete@example.com"
    And a registered user with email "carol@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    When I sign in as "carol@example.com"
    And I try to view the last survey run
    Then I am denied access

  Scenario: Accept a response when a member submits to their team survey
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    When I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey
    Then my response is saved for team "Road Runners"

  Scenario: Deny a removed member trying to respond to a survey
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    And I remove "murat@example.com" from team "Road Runners"
    When I sign in as "murat@example.com"
    And I try to view the last survey run
    Then I am denied access

  Scenario: Deny a non-member trying to view the survey details page
    Given a registered user with email "pete@example.com"
    And a registered user with email "carol@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I navigate to the survey run page for team "Road Runners"
    When I sign in as "carol@example.com"
    And I try to view the last survey run
    Then I am denied access
