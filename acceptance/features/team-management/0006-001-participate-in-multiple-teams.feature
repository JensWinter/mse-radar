Feature: 0006-001 Participate in multiple teams
  As a user who belongs to several teams
  I want each team kept separate
  So that I see the right teams, survey runs and results

  Scenario: See all teams when a member of multiple teams
    Given a registered user with email "multiuser@example.com"
    And a registered user with email "teamalead@example.com"
    And a registered user with email "teamblead@example.com"
    And I sign in as "teamalead@example.com"
    And I create a team "Team Alpha" described as "First team for testing"
    And I add "multiuser@example.com" to team "Team Alpha"
    And I sign in as "teamblead@example.com"
    And I create a team "Team Beta" described as "Second team for testing"
    And I add "multiuser@example.com" to team "Team Beta"
    When I sign in as "multiuser@example.com"
    And I open the home page
    Then I see team "Team Alpha" in my team list
    And I see team "Team Beta" in my team list

  Scenario: See only the survey runs of the team being viewed
    Given a registered user with email "multiuser@example.com"
    And a registered user with email "teamalead@example.com"
    And a registered user with email "teamblead@example.com"
    And I sign in as "teamalead@example.com"
    And I create a team "Team Alpha" described as "First team for testing"
    And I add "multiuser@example.com" to team "Team Alpha"
    And I create a survey run for team "Team Alpha"
    And I sign in as "teamblead@example.com"
    And I create a team "Team Beta" described as "Second team for testing"
    And I add "multiuser@example.com" to team "Team Beta"
    And I create a survey run for team "Team Beta"
    When I sign in as "multiuser@example.com"
    And I open the details of team "Team Alpha"
    Then I see team "Team Alpha" described as "First team for testing" led by "teamalead@example.com" with 1 survey run
    When I open the details of team "Team Beta"
    Then I see team "Team Beta" described as "Second team for testing" led by "teamblead@example.com" with 1 survey run

  Scenario: See separate results for each team
    Given a registered user with email "multiuser@example.com"
    And a registered user with email "teamalead@example.com"
    And a registered user with email "teamblead@example.com"
    And I sign in as "teamalead@example.com"
    And I create a team "Team Alpha" described as "First team for testing"
    And I add "multiuser@example.com" to team "Team Alpha"
    And I create a survey run for team "Team Alpha"
    And I open the survey run for team "Team Alpha"
    And I sign in as "teamblead@example.com"
    And I create a team "Team Beta" described as "Second team for testing"
    And I add "multiuser@example.com" to team "Team Beta"
    And I create a survey run for team "Team Beta"
    And I open the survey run for team "Team Beta"
    And I sign in as "multiuser@example.com"
    And I navigate to the survey run page for team "Team Alpha"
    And I answer the survey with "5,5,5,5,5,5,5,5,5,5"
    And I navigate to the survey run page for team "Team Beta"
    And I answer the survey with "3,3,3,3,3,3,3,3,3,3"
    And I sign in as "teamalead@example.com"
    And I close the survey run for team "Team Alpha"
    And I sign in as "teamblead@example.com"
    And I close the survey run for team "Team Beta"
    And I sign in as "multiuser@example.com"
    When I view the assessment results for team "Team Alpha"
    Then the assessment results are displayed
    And the capability scores are displayed
    When I view the assessment results for team "Team Beta"
    Then the assessment results are displayed
    And the capability scores are displayed
