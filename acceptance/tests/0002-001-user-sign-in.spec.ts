import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0002-001: User Sign-in', () => {
  it('should allow access to protected features when signed in', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    await dsl.identityAndAccess.registerUser();

    // When
    await dsl.identityAndAccess.signIn();

    // Then
    await dsl.identityAndAccess.confirmCanAccessProtectedFeatures();
  });

  it('should fail to sign in with an incorrect password', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    await dsl.identityAndAccess.registerUser({
      email: 'laura@example.com',
      password: 'password123',
    });

    // When
    await dsl.identityAndAccess.signIn({
      email: 'laura@example.com',
      password: 'incorrectPasswordAbc',
    });

    // Then
    await dsl.identityAndAccess.confirmLoginFailedErrorMessage();
  });

  it('should redirect to login when accessing protected features and not signed in', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    // Nothing to arrange

    // When
    await dsl.identityAndAccess.accessProtectedFeatures();

    // Then
    await dsl.identityAndAccess.confirmRedirectToLoginPage();
  });

  it('should remain signed in while navigating through the application', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    await dsl.identityAndAccess.registerUser();
    await dsl.identityAndAccess.signIn();

    // When
    await dsl.identityAndAccess.navigateThroughApplication();

    // Then
    await dsl.identityAndAccess.confirmStillSignedIn();
  });
});
