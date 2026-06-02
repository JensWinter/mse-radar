Feature: 0008-001 Create survey run
  As a team lead
  I want to create survey runs for my team
  So that members can submit responses

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"

  Scenario: Create a new survey run
    When I create a survey run "Sprint 123" for team "Road Runners"
    Then I see team "Road Runners" led by "pete@example.com" with 1 survey run
    And the survey run "Sprint 123" is listed for team "Road Runners"

  Scenario: New survey run appears on the team details page for a member
    Given I create a survey run for team "Road Runners"
    When I sign in as "murat@example.com"
    And I open the details of team "Road Runners"
    Then I see team "Road Runners" led by "pete@example.com" with 1 survey run

  Scenario: Non-team-leads cannot create a survey run
    When I sign in as "murat@example.com"
    And I open the details of team "Road Runners"
    Then I cannot create a survey run

  Scenario: View details of a newly created survey run
    Given I create a survey run for team "Road Runners"
    When I navigate to the survey run page for team "Road Runners"
    Then the survey run status is "pending"
