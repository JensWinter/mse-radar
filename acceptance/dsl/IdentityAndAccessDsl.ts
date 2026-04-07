import { ProtocolDriver } from '../drivers/ProtocolDriver.ts';

export type RegisterUserParams = {
  email?: string;
  password?: string;
};

export type SignInParams = {
  email?: string;
  password?: string;
};

export type ConfirmSuccessfulSignInParams = {
  email?: string;
};

const DEFAULT_DUMMY_EMAIL = 'clara@example.com';
const DEFAULT_DUMMY_PASSWORD = 'password123';

export class IdentityAndAccessDsl {
  constructor(private readonly driver: ProtocolDriver) {
  }

  async registerUser(params?: RegisterUserParams) {
    await this.driver.openUserRegistrationPage();
    const email = params?.email ?? DEFAULT_DUMMY_EMAIL;
    const password = params?.password ?? DEFAULT_DUMMY_PASSWORD;
    await this.driver.registerUser(email, password);
  }

  async confirmRegistrationConfirmationMessage() {
    await this.driver.confirmRegistrationConfirmationMessage();
  }

  async confirmDuplicateEmailErrorMessage() {
    await this.driver.confirmDuplicateEmailErrorMessage();
  }

  async confirmInvalidPasswordErrorMessage() {
    await this.driver.confirmInvalidPasswordErrorMessage();
  }

  async signIn(params?: SignInParams) {
    await this.driver.openLoginPage();

    const email = params?.email ?? DEFAULT_DUMMY_EMAIL;
    const password = params?.password ?? DEFAULT_DUMMY_PASSWORD;
    await this.driver.loginUser(email, password);
  }

  async confirmSuccessfulSignIn(params?: ConfirmSuccessfulSignInParams) {
    const email = params?.email ?? DEFAULT_DUMMY_EMAIL;
    await this.driver.confirmSuccessfulSignIn(email);
  }

  async confirmCanAccessProtectedFeatures() {
    await this.driver.confirmCanAccessProtectedFeatures();
  }

  async confirmLoginFailedErrorMessage() {
    await this.driver.confirmLoginFailedErrorMessage();
  }

  async accessProtectedFeatures() {
    await this.driver.accessAccountPageDirectly();
  }

  async confirmRedirectToLoginPage() {
    await this.driver.confirmRedirectToLoginPage();
  }

  async navigateThroughApplication() {
    await this.driver.navigateThroughApplication();
  }

  async confirmStillSignedIn() {
    await this.driver.confirmCanAccessProtectedFeatures();
  }

  async signOut() {
    await this.driver.signOut();
  }

  async confirmRedirectToHomePage() {
    await this.driver.confirmRedirectToHomePage();
  }
}
