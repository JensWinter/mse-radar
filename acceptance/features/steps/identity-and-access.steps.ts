import { Given, Then, When } from '@cucumber/cucumber';
import { McRadarWorld } from '../support/world.ts';

/**
 * Step definitions for the Identity & Access bounded context.
 *
 * Steps are thin wrappers over IdentityAndAccessDsl — no logic lives here.
 * Literal emails pass straight to the DSL, which namespaces them with the
 * per-scenario token, so scenarios stay isolated under parallel execution.
 */

Given('a registered user with email {string}', async function (this: McRadarWorld, email: string) {
  await this.dsl.identityAndAccess!.registerUser({ email });
});

Given(
  'a registered user with email {string} and password {string}',
  async function (this: McRadarWorld, email: string, password: string) {
    await this.dsl.identityAndAccess!.registerUser({ email, password });
  },
);

Given('I am a registered, signed-in user', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.registerUser();
  await this.dsl.identityAndAccess!.signIn();
});

When('I register a new user', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.registerUser();
});

When(
  'I register with email {string} and password {string}',
  async function (this: McRadarWorld, email: string, password: string) {
    await this.dsl.identityAndAccess!.registerUser({ email, password });
  },
);

When('I register with email {string}', async function (this: McRadarWorld, email: string) {
  await this.dsl.identityAndAccess!.registerUser({ email });
});

When('I sign in', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.signIn();
});

When('I sign in as {string}', async function (this: McRadarWorld, email: string) {
  await this.dsl.identityAndAccess!.signIn({ email });
});

When(
  'I sign in as {string} with password {string}',
  async function (this: McRadarWorld, email: string, password: string) {
    await this.dsl.identityAndAccess!.signIn({ email, password });
  },
);

When('I sign out', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.signOut();
});

When('I access a protected page', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.accessProtectedFeatures();
});

When('I navigate through the application', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.navigateThroughApplication();
});

Then('I see a registration confirmation', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.confirmRegistrationConfirmationMessage();
});

Then('I see a duplicate email error', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.confirmDuplicateEmailErrorMessage();
});

Then('I see an invalid password error', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.confirmInvalidPasswordErrorMessage();
});

Then('I am signed in as {string}', async function (this: McRadarWorld, email: string) {
  await this.dsl.identityAndAccess!.confirmSuccessfulSignIn({ email });
});

Then('I can access protected features', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.confirmCanAccessProtectedFeatures();
});

Then('I see a login failed error', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.confirmLoginFailedErrorMessage();
});

Then('I am redirected to the login page', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.confirmRedirectToLoginPage();
});

Then('I am redirected to the home page', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.confirmRedirectToHomePage();
});

Then('I am still signed in', async function (this: McRadarWorld) {
  await this.dsl.identityAndAccess!.confirmStillSignedIn();
});
