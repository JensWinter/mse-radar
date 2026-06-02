Feature: 0012-001 Block responses when survey not open
  As the system
  I want to block responses unless the survey run is open
  So that data is only collected during an active run

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"

  Scenario: Show "not yet open" when the survey is pending
    Given I create a survey run for team "Road Runners"
    When I navigate to the survey run page for team "Road Runners"
    Then the survey is not yet open

  Scenario: Show "closed" when the survey is closed
    Given I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    And I close the survey run for team "Road Runners"
    When I navigate to the survey run page for team "Road Runners"
    Then the survey run is closed

  Scenario: Show "no survey available" when no survey run exists
    When I open the details of team "Road Runners"
    Then no survey is available

  Scenario: Accept the response when the survey is open
    Given I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"
    When I navigate to the survey run page for team "Road Runners"
    And I answer the survey
    Then my response is saved for team "Road Runners"
