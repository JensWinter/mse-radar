Feature: 0003-003 Edit team details
  As a team lead
  I want to edit my team's name and description
  So that the team details stay accurate

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners" described as "The best team in the world!"

  Scenario: Team lead edits the team name and description
    When I rename team "Road Runners" to "Speed Demons" described as "Even faster than before!"
    Then I see team "Speed Demons" described as "Even faster than before!" led by "pete@example.com"

  Scenario: Regular members cannot see the edit option
    Given I add "murat@example.com" to team "Road Runners"
    When I sign in as "murat@example.com"
    And I open the details of team "Road Runners"
    Then I cannot see the edit team button

  Scenario: Updated information is displayed after editing
    Given I rename team "Road Runners" to "Updated Team" described as "Updated description"
    When I open the details of team "Updated Team"
    Then I see team "Updated Team" described as "Updated description" led by "pete@example.com"
