import { ProtocolDriver } from '../drivers/ProtocolDriver.ts';
import { Browser, BrowserContext, chromium } from 'playwright';
import { AstroSutHandle } from '../sut/astroSut.ts';
import { IdentityAndAccessDsl } from './IdentityAndAccessDsl.ts';
import { TeamManagementDsl } from './TeamManagementDsl.ts';
import { SurveyDefinitionDsl } from './SurveyDefinitionDsl.ts';
import { SurveyExecutionDsl } from './SurveyExecutionDsl.ts';

export type CompleteSurveyRunParams = {
  teamName: string;
  title: string;
  leadEmail: string;
  memberEmail: string;
  answers: string;
};

export class Dsl {
  private browser: Browser | undefined;
  private context: BrowserContext | undefined;

  private _identityAndAccess?: IdentityAndAccessDsl;
  private _teamManagement?: TeamManagementDsl;
  private _surveyDefinition?: SurveyDefinitionDsl;
  private _surveyExecution?: SurveyExecutionDsl;

  get identityAndAccess(): IdentityAndAccessDsl {
    if (!this._identityAndAccess) throw new Error('Dsl not set up — Before hook missing?');
    return this._identityAndAccess;
  }

  get teamManagement(): TeamManagementDsl {
    if (!this._teamManagement) throw new Error('Dsl not set up — Before hook missing?');
    return this._teamManagement;
  }

  get surveyDefinition(): SurveyDefinitionDsl {
    if (!this._surveyDefinition) throw new Error('Dsl not set up — Before hook missing?');
    return this._surveyDefinition;
  }

  get surveyExecution(): SurveyExecutionDsl {
    if (!this._surveyExecution) throw new Error('Dsl not set up — Before hook missing?');
    return this._surveyExecution;
  }

  async setUpBrowser() {
    this.browser = await chromium.launch({ timeout: 30000 });
  }

  async tearDownBrowser() {
    await this.browser?.close();
  }

  async setUp(sut: AstroSutHandle, token: string) {
    if (!this.browser) {
      throw new Error('Browser not set up. Call setUpBrowser() first.');
    }

    this.context = await this.browser.newContext({ baseURL: sut.baseUrl });
    this.context.setDefaultTimeout(2000);
    const page = await this.context.newPage();
    await page.goto('/');
    const driver = new ProtocolDriver(page);
    this._identityAndAccess = new IdentityAndAccessDsl(driver, token);
    this._teamManagement = new TeamManagementDsl(driver, token);
    this._surveyDefinition = new SurveyDefinitionDsl(driver);
    this._surveyExecution = new SurveyExecutionDsl(driver, token);
  }

  async tearDown() {
    await this.context?.close();
  }

  /**
   * Cross-context orchestration of a full survey-run lifecycle: team lead creates
   * and opens a survey, a member answers it, then the lead closes it. Leaves the
   * lead signed in.
   */
  async completeSurveyRun(params: CompleteSurveyRunParams) {
    const run = { teamName: params.teamName, title: params.title };
    await this.identityAndAccess.signIn({ email: params.leadEmail });
    await this.surveyExecution.createSurveyRun(run);
    await this.surveyExecution.openSurveyRun(run);
    await this.identityAndAccess.signIn({ email: params.memberEmail });
    await this.surveyExecution.openSurveyRunPage(run);
    await this.surveyExecution.answerSurvey({ answers: params.answers });
    await this.identityAndAccess.signIn({ email: params.leadEmail });
    await this.surveyExecution.closeSurveyRun(run);
  }
}
