import { ProtocolDriver } from '../drivers/ProtocolDriver.ts';
import { Browser, BrowserContext, chromium } from 'playwright/test';
import { AstroSutHandle } from '../sut/astroSut.ts';
import { IdentityAndAccessDsl } from './IdentityAndAccessDsl.ts';
import { TeamManagementDsl } from './TeamManagementDsl.ts';
import { SurveyDefinitionDsl } from './SurveyDefinitionDsl.ts';
import { SurveyExecutionDsl } from './SurveyExecutionDsl.ts';

export class Dsl {
  private browser: Browser | undefined;
  private context: BrowserContext | undefined;

  public identityAndAccess: IdentityAndAccessDsl | undefined;
  public teamManagement: TeamManagementDsl | undefined;
  public surveyDefinition: SurveyDefinitionDsl | undefined;
  public surveyExecution: SurveyExecutionDsl | undefined;

  async setUpBrowser() {
    this.browser = await chromium.launch();
  }

  async tearDownBrowser() {
    await this.browser?.close();
  }

  async setUp(sut: AstroSutHandle) {
    if (!this.browser) {
      throw new Error('Browser not set up. Call setUpBrowser() first.');
    }

    this.context = await this.browser.newContext({ baseURL: sut.baseUrl });
    this.context.setDefaultTimeout(2000);
    const page = await this.context.newPage();
    await page.goto('/');
    const driver = new ProtocolDriver(page);
    this.identityAndAccess = new IdentityAndAccessDsl(driver);
    this.teamManagement = new TeamManagementDsl(driver);
    this.surveyDefinition = new SurveyDefinitionDsl(driver);
    this.surveyExecution = new SurveyExecutionDsl(driver);
  }

  async tearDown() {
    await this.context?.close();
  }
}
