Feature: 0004-001 Add team member
  As a team lead
  I want to add registered users to my team
  So that they can participate in surveys

  Background:
    Given a registered user with email "teamlead@example.com"
    And a registered user with email "newmember@example.com"
    And a registered user with email "regularmember@example.com"
    And I sign in as "teamlead@example.com"
    And I create a team "Road Runners"

  Scenario: Team lead adds a team member
    When I add "newmember@example.com" to team "Road Runners"
    And I open the members of team "Road Runners"
    Then "newmember@example.com" is listed as a team member

  Scenario: Newly added member sees the team in their list
    Given I add "newmember@example.com" to team "Road Runners"
    When I sign in as "newmember@example.com"
    And I open the home page
    Then I see team "Road Runners" in my team list

  Scenario: Regular members cannot add team members
    Given I add "regularmember@example.com" to team "Road Runners"
    When I sign in as "regularmember@example.com"
    And I open the members of team "Road Runners"
    Then I cannot see the add member button

  Scenario: Adding an existing member shows an error
    Given I add "newmember@example.com" to team "Road Runners"
    When I add "newmember@example.com" to team "Road Runners"
    Then I see an add member error containing "is already a member of this team"
