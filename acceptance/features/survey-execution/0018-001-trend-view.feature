Feature: 0018-001 Trend view
  As a team member
  I want to compare capability scores across survey runs
  So that I can see whether the team is improving

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And a registered user with email "outsider@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"

  Scenario: Capability scores are compared across multiple survey runs
    Given a completed survey run "Sprint 1" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "2,3,3,3,3,3,3,3,3,3"
    And a completed survey run "Sprint 2" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "3,4,4,4,4,4,4,4,4,4"
    And a completed survey run "Sprint 3" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "4,5,5,5,5,5,5,5,5,5"
    When I sign in as "murat@example.com"
    And I view the trend view for team "Road Runners"
    Then the trend visualization is displayed
    And the trend cards cover 3 survey runs

  Scenario: A member can see whether a capability improved or declined
    Given a completed survey run "Sprint 1" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "2,4,3"
    And a completed survey run "Sprint 2" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "5,1,3"
    When I sign in as "murat@example.com"
    And I view the trend view for team "Road Runners"
    Then the trend visualization is displayed
    And capability "Version control" improved from run "Sprint 1" to run "Sprint 2"
    And capability "Trunk-based development" declined from run "Sprint 1" to run "Sprint 2"
    And capability "Code maintainability" remained unchanged from run "Sprint 1" to run "Sprint 2"

  Scenario: Survey runs appear in chronological order on the timeline
    Given a completed survey run "Sprint 1" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "3,3,3,3,3,3,3,3,3,3"
    And a completed survey run "Sprint 2" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "4,4,4,4,4,4,4,4,4,4"
    And a completed survey run "Sprint 3" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "5,5,5,5,5,5,5,5,5,5"
    When I sign in as "murat@example.com"
    And I view the trend view for team "Road Runners"
    Then the runs appear in chronological order "Sprint 1,Sprint 2,Sprint 3"

  Scenario: Non-team members are denied access to the trend view
    Given a completed survey run "Sprint 1" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "1,3,3,3,3,3,3,3,3,3"
    And a completed survey run "Sprint 2" for team "Road Runners" led by "pete@example.com" answered by "murat@example.com" with "2,4,4,4,4,4,4,4,4,4"
    And I sign in as "murat@example.com"
    And I view the trend view for team "Road Runners"
    When I sign in as "outsider@example.com"
    And I try to view the trend view
    Then I am denied access
