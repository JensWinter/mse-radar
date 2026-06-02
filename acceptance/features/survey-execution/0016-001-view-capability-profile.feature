Feature: 0016-001 View capability profile
  As a team member
  I want a visual capability profile of a closed survey run
  So that I can read the team's maturity at a glance

  Background:
    Given a registered user with email "pete@example.com"
    And a registered user with email "murat@example.com"
    And a registered user with email "laura@example.com"
    And a registered user with email "outsider@example.com"
    And I sign in as "pete@example.com"
    And I create a team "Road Runners"
    And I add "murat@example.com" to team "Road Runners"
    And I add "laura@example.com" to team "Road Runners"
    And I create a survey run for team "Road Runners"
    And I open the survey run for team "Road Runners"

  Scenario: A visual representation of all capability scores is shown
    Given I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "5,4,4,5,3,5,4,4,5,3"
    And I sign in as "pete@example.com"
    And I close the survey run for team "Road Runners"
    When I view the capability profile for team "Road Runners"
    Then the capability profile visualization is displayed

  Scenario: Maturity levels are easy to identify
    Given I sign in as "murat@example.com"
    And I navigate to the survey run page for team "Road Runners"
    And I answer the survey with "5,2,4,1,3,5,2,4,1,3"
    And I sign in as "pete@example.com"
    And I close the survey run for team "Road Runners"
    When I view the capability profile for team "Road Runners"
    Then the maturity levels are identifiable

  Scenario: The latest survey run's profile is shown by default
    Given I navigate to the survey run page for team "Road Runners"
    And I answer the survey
    And I close the survey run for team "Road Runners"
    When I open the details of team "Road Runners"
    And I access the latest survey run results
    Then the capability profile visualization is displayed

  Scenario: Non-members are denied access to the capability profile
    Given I navigate to the survey run page for team "Road Runners"
    And I answer the survey
    And I close the survey run for team "Road Runners"
    When I sign in as "outsider@example.com"
    And I try to view the capability profile
    Then I am denied access
