Feature: 0011-001 Submit survey response
  As a team member
  I want to submit a survey response
  So that my input is captured for the team

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"

  Scenario: Save the response and show a confirmation when submitted
    Given I navigate to the survey run page for team "Road Runners"
    When I answer the survey
    Then my response is saved for team "Road Runners"

  Scenario: Each question offers a 5-point scale
    When I navigate to the survey run page for team "Road Runners"
    Then every question has a 5-point scale

  Scenario: All questions are answerable
    When I navigate to the survey run page for team "Road Runners"
    Then every question is answerable

  Scenario: Display own answers when viewing my submission
    Given I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "1,2,3,null,4,5,4,3,null"
    When I navigate to the survey run page for team "Road Runners"
    Then my answers are "1,2,3,null,4,5,4,3,null"
