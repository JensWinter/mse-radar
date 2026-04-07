import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0001-001: User registration', () => {
  it('should create a new user account', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    // Nothing to arrange

    // When
    await dsl.identityAndAccess.registerUser();

    // Then
    await dsl.identityAndAccess.confirmRegistrationConfirmationMessage();
  });

  it('should prevent duplicate email addresses', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    await dsl.identityAndAccess.registerUser({ email: 'laura@example.com' });

    // When
    await dsl.identityAndAccess.registerUser({ email: 'laura@example.com' });

    // Then
    await dsl.identityAndAccess.confirmDuplicateEmailErrorMessage();
  });

  it('should prevent insecure passwords', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    // Nothing to arrange

    // When
    await dsl.identityAndAccess.registerUser({ email: 'laura@example.com', password: '123456' });

    // Then
    await dsl.identityAndAccess.confirmInvalidPasswordErrorMessage();
  });

  it('should be able to log in with the newly created account', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    await dsl.identityAndAccess.registerUser({
      email: 'laura@example.com',
      password: 'password123',
    });

    // When
    await dsl.identityAndAccess.signIn({
      email: 'laura@example.com',
      password: 'password123',
    });

    // Then
    await dsl.identityAndAccess.confirmSuccessfulSignIn({ email: 'laura@example.com' });
  });
});
