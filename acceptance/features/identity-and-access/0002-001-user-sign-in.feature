Feature: 0002-001 User sign-in
  As a registered user
  I want to sign in
  So that I can access protected features

  Scenario: Access protected features when signed in
    Given a registered user with email "clara@example.com"
    When I sign in as "clara@example.com" with password "password123"
    Then I can access protected features

  Scenario: Fail to sign in with an incorrect password
    Given a registered user with email "laura@example.com" and password "password123"
    When I sign in as "laura@example.com" with password "incorrectPasswordAbc"
    Then I see a login failed error

  Scenario: Redirect to login when accessing protected features while signed out
    When I access a protected page
    Then I am redirected to the login page

  Scenario: Remain signed in while navigating the application
    Given I am a registered, signed-in user
    When I navigate through the application
    Then I am still signed in
