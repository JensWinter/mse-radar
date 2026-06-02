Feature: 0007-001 DORA capabilities-based survey
  As a survey participant
  I want each question tied to a DORA capability
  So that I understand what is being assessed

  Background:
    Given a registered user with email "pete@example.com"
    And I sign in as "pete@example.com"

  Scenario: Each question corresponds to one DORA capability
    Given I open the survey model
    When I read the survey questions
    Then each question maps to a DORA capability

  Scenario: Each question indicates the capability being assessed
    Given I open the survey model
    When I read the survey questions
    Then each question shows its DORA capability name

  Scenario: The survey covers the full set of DORA capabilities
    Given I open the survey model
    When I read the survey questions
    Then all DORA capabilities are covered
