Feature: 0010-001 Survey run isolation
  As a team member
  I want each survey run kept independent
  So that results and history are not mixed up

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"

  Scenario: Viewing a survey run shows only that run's data
    Given a completed survey run "Sprint 1" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "2,2,2,2,2,2,2,2,2,2"
    And a completed survey run "Sprint 2" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "4,4,4,4,4,4,4,4,4,4"
    When I navigate to the survey run page "Sprint 1" for team "Road Runners"
    Then the assessment results are displayed
    And the total response count is 1
    And the aggregated score for capability "Continuous integration" is 2.0

  Scenario: Submitting to a new survey run preserves old responses
    Given a completed survey run "Sprint 1" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "3,3,3,3,3,3,3,3,3,3"
    And a completed survey run "Sprint 2" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "5,5,5,5,5,5,5,5,5,5"
    When I navigate to the survey run page "Sprint 1" for team "Road Runners"
    Then the assessment results are displayed
    And the aggregated score for capability "Continuous integration" is 3.0

  Scenario: All survey runs appear in the team history
    Given I create a survey run "Sprint 1" for team "Road Runners"
    And I open the survey run "Sprint 1" for team "Road Runners"
    And I close the survey run "Sprint 1" for team "Road Runners"
    And I create a survey run "Sprint 2" for team "Road Runners"
    And I open the survey run "Sprint 2" for team "Road Runners"
    And I close the survey run "Sprint 2" for team "Road Runners"
    And I create a survey run "Sprint 3" for team "Road Runners"
    When I open the details of team "Road Runners"
    Then I see 3 survey runs in the history

  Scenario: Each closed survey run shows its own independent results
    Given a completed survey run "Sprint 1" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "2,2,2,2,2,2,2,2,2,2"
    And a completed survey run "Sprint 2" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "4,4,4,4,4,4,4,4,4,4"
    When I navigate to the survey run page "Sprint 1" for team "Road Runners"
    Then the assessment results are displayed
    And the aggregated score for capability "Continuous integration" is 2.0
    When I navigate to the survey run page "Sprint 2" for team "Road Runners"
    Then the assessment results are displayed
    And the aggregated score for capability "Continuous integration" is 4.0
