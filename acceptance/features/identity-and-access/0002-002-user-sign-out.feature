Feature: 0002-002 User sign-out
  As a signed-in user
  I want to sign out
  So that my session is ended

  Background:
    Given I am a registered, signed-in user

  Scenario: Redirect to the home page after signing out
    When I sign out
    Then I am redirected to the home page

  Scenario: No access to protected features after signing out
    When I sign out
    And I access a protected page
    Then I am redirected to the login page
