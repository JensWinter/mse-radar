Feature: 0001-001 User registration
  As a new user
  I want to register an account
  So that I can access the application

  Scenario: Create a new user account
    When I register a new user
    Then I see a registration confirmation

  Scenario: Prevent duplicate email addresses
    Given a registered user with email "laura@example.com"
    When I register with email "laura@example.com"
    Then I see a duplicate email error

  Scenario: Prevent insecure passwords
    When I register with email "laura@example.com" and password "123456"
    Then I see an invalid password error

  Scenario: Log in with the newly created account
    Given a registered user with email "laura@example.com" and password "password123"
    When I sign in as "laura@example.com" with password "password123"
    Then I am signed in as "laura@example.com"
