Feature: 0004-002 Remove team member
  As a team lead
  I want to remove team members
  So that the team roster stays accurate

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And a registered user with email "carol@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"

  Scenario: Team lead removes a team member
    Given I add "murat@example.com" to team "Road Runners"
    When I remove "murat@example.com" from team "Road Runners"
    And I open the members of team "Road Runners"
    Then "murat@example.com" is not listed as a team member

  Scenario: Removed member no longer sees the team in their list
    Given I add "murat@example.com" to team "Road Runners"
    And I remove "murat@example.com" from team "Road Runners"
    When I sign in as "murat@example.com"
    And I open the home page
    Then I do not see team "Road Runners" in my team list

  Scenario: Regular members cannot remove team members
    Given I add "carol@example.com" to team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    When I sign in as "carol@example.com"
    And I open the members of team "Road Runners"
    Then I cannot see the remove member button

  Scenario: Removing the last team lead shows an error
    When I remove "pete@example.com" from team "Road Runners"
    Then I see a remove member error containing "Cannot remove the last team lead"
