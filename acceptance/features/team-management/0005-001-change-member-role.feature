Feature: 0005-001 Change team member role
  As a team lead
  I want to promote and demote team members
  So that the team has the right leads

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "sarah@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"

  Scenario: Team lead promotes a member to team lead
    Given I add "murat@example.com" to team "Road Runners"
    When I promote "murat@example.com" to team lead in team "Road Runners"
    And I open the members of team "Road Runners"
    Then "murat@example.com" is listed as a team lead

  Scenario: Team lead demotes another team lead to member
    Given I add "sarah@example.com" to team "Road Runners"
    And I promote "sarah@example.com" to team lead in team "Road Runners"
    When I demote "sarah@example.com" to member in team "Road Runners"
    And I open the members of team "Road Runners"
    Then "sarah@example.com" is listed as a team member

  Scenario: Demoting the last team lead shows an error
    When I demote "pete@example.com" to member in team "Road Runners"
    Then I see a change role error containing "Cannot demote the last team lead"

  Scenario: Regular members cannot change roles
    Given I add "murat@example.com" to team "Road Runners"
    When I sign in as "murat@example.com"
    And I open the members of team "Road Runners"
    Then I cannot see the change role button
