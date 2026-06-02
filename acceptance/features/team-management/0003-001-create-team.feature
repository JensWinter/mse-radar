Feature: 0003-001 Create team
  As a signed-in user
  I want to create a team
  So that I can manage it and run surveys

  Background:
    Given a registered user with email "laura@example.com"
    And I sign in as "laura@example.com"

  Scenario: Create a team with the creator as team lead
    When I create a team "Road Runners"
    Then team "Road Runners" is created
    And "laura@example.com" is the team lead of team "Road Runners"

  Scenario: Show the new team in the user's team list
    Given I create a team "Road Runners"
    When I open the home page
    Then I see team "Road Runners" in my team list

  Scenario: Show details of the new team
    Given I create a team "Road Runners"
    When I open the details of team "Road Runners"
    Then I see team "Road Runners" led by "laura@example.com"
