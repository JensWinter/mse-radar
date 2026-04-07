import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0002-002: User Sign-out', () => {
  it('should redirect to home page after signing out', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    await dsl.identityAndAccess.registerUser();
    await dsl.identityAndAccess.signIn();

    // When
    await dsl.identityAndAccess.signOut();

    // Then
    await dsl.identityAndAccess.confirmRedirectToHomePage();
  });

  it('should not allow access to protected features after signing out', async () => {
    assertExists(dsl.identityAndAccess);

    // Given
    await dsl.identityAndAccess.registerUser();
    await dsl.identityAndAccess.signIn();

    // When
    await dsl.identityAndAccess.signOut();
    await dsl.identityAndAccess.accessProtectedFeatures();

    // Then
    await dsl.identityAndAccess.confirmRedirectToLoginPage();
  });
});
