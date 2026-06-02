Feature: 0019-001 DORA capability details
  As a survey participant
  I want to read a capability's description and DORA link while answering
  So that I understand what is being assessed

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    And I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"

  Scenario: Show capability description and DORA link for a survey question
    When I open the DORA capability info
    Then the DORA capability description is visible
    And the DORA capability link is visible
