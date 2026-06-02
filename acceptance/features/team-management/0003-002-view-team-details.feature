Feature: 0003-002 View team details
  As a team member
  I want to view team details
  So that I can see the team name, description, lead and members

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And a registered user with email "carol@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners" described as "The best team in the world!"

  Scenario: Team member views team details
    When I open the details of team "Road Runners"
    Then I see team "Road Runners" described as "The best team in the world!" led by "pete@example.com"

  Scenario: Team lead and members are listed in team details
    Given I add "murat@example.com" to team "Road Runners"
    When I open the members of team "Road Runners"
    Then "pete@example.com" is listed as a team lead
    And "murat@example.com" is listed as a team member

  Scenario: Non-members are denied access to team details
    Given I open the details of team "Road Runners"
    When I sign in as "carol@example.com"
    And I try to open the team details directly
    Then I am denied access to the team details
