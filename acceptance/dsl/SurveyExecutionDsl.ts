import { ProtocolDriver } from '../drivers/ProtocolDriver.ts';

export type CreateSurveyRunParams = {
  teamName: string;
  title?: string;
};

export type ConfirmSurveyRunIsListedParams = {
  teamName: string;
  title?: string;
};

export type OpenSurveyRunPageParams = {
  teamName: string;
  title?: string;
};

export type ConfirmSurveyRunDetailsParams = {
  status?: string;
};

export type OpenSurveyRunParams = {
  teamName: string;
  title?: string;
};

export type ConfirmAcceptsSurveyResponse = {
  teamName: string;
  title?: string;
};

export type AnswerSurveyParams = {
  answers?: (number | null)[];
};

export type ConfirmResponseSavedParams = {
  teamName: string;
  surveyTitle?: string;
  answers?: (number | null)[];
};

export type ConfirmMyAnswersParams = {
  answers: (number | null)[];
};

export type CloseSurveyRunParams = {
  teamName: string;
  title?: string;
};

export type ReopenSurveyRunParams = {
  teamName: string;
  title?: string;
};

export type ViewAssessmentResultsParams = {
  teamName: string;
  surveyTitle?: string;
};

export type ConfirmAggregatedScoreParams = {
  capabilityName: string;
  expectedScore: number;
};

export type ConfirmTotalResponsesParams = {
  expectedCount: number;
};

export type ViewCapabilityProfileParams = {
  teamName: string;
  surveyTitle?: string;
};

export type AccessGuidanceParams = {
  capabilityName: string;
};

export type ConfirmGuidanceDisplayedParams = {
  capabilityName: string;
};

export type ConfirmGuidanceTextParams = {
  text: string;
};

export type ConfirmSurveyRunCountParams = {
  expectedCount: number;
};

const DEFAULT_SURVEY_RUN_TITLE = 'Survey 1';
const DEFAULT_SURVEY_RUN_ANSWERS = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4];

export class SurveyExecutionDsl {
  constructor(private readonly driver: ProtocolDriver) {
  }

  async createSurveyRun(params: CreateSurveyRunParams) {
    const title = params.title ?? DEFAULT_SURVEY_RUN_TITLE;
    await this.driver.createSurveyRun(params.teamName, title);
  }

  async confirmCreatingSurveyRunNotPossible() {
    await this.driver.confirmCreatingSurveyRunNotPossible();
  }

  async confirmSurveyRunIsListed(params: ConfirmSurveyRunIsListedParams) {
    const title = params.title ?? DEFAULT_SURVEY_RUN_TITLE;
    await this.driver.confirmSurveyRunIsListed(params.teamName, title);
  }

  async openSurveyRunPage(params: OpenSurveyRunPageParams) {
    const title = params.title ?? DEFAULT_SURVEY_RUN_TITLE;
    await this.driver.openSurveyRunPage(params.teamName, title);
  }

  async confirmSurveyRunCount(params: ConfirmSurveyRunCountParams) {
    await this.driver.confirmSurveyRunCount(params.expectedCount);
  }

  async confirmSurveyRunDetails(params?: ConfirmSurveyRunDetailsParams) {
    const status = params?.status ?? 'pending';
    await this.driver.confirmSurveyRunDetails(status);
  }

  async openSurveyRun(params: OpenSurveyRunParams) {
    const title = params.title ?? DEFAULT_SURVEY_RUN_TITLE;
    await this.driver.openSurveyRun(params.teamName, title);
  }

  async confirmAcceptsSurveyResponse(params: ConfirmAcceptsSurveyResponse) {
    const title = params.title ?? DEFAULT_SURVEY_RUN_TITLE;
    await this.driver.openSurveyRunPage(params.teamName, title);
    await this.driver.confirmAcceptsSurveyResponse();
  }

  async confirmOpeningSurveyRunIsNotPossible() {
    await this.driver.confirmOpeningSurveyRunIsNotPossible();
  }

  async answerSurvey(params?: AnswerSurveyParams) {
    const answers = params?.answers ?? DEFAULT_SURVEY_RUN_ANSWERS;
    await this.driver.answerSurvey(answers);
  }

  async confirmResponseSaved(params: ConfirmResponseSavedParams) {
    const title = params.surveyTitle ?? DEFAULT_SURVEY_RUN_TITLE;
    const answers = params.answers ?? DEFAULT_SURVEY_RUN_ANSWERS;
    await this.driver.confirmResponseSaved(params.teamName, title, answers);
  }

  async confirmAllQuestionsHave7PointScale() {
    await this.driver.confirmAllQuestionsHave7PointScale();
  }

  async confirmAllQuestionsAreAnswerable() {
    await this.driver.confirmAllQuestionsAreAnswerable();
  }

  async confirmMyAnswers(params: ConfirmMyAnswersParams) {
    await this.driver.confirmMyAnswers(params.answers);
  }

  async confirmCannotAnswerSurvey() {
    await this.driver.confirmCannotAnswerSurvey();
  }

  // Assessment Results

  async closeSurveyRun(params: CloseSurveyRunParams) {
    const title = params.title ?? DEFAULT_SURVEY_RUN_TITLE;
    await this.driver.closeSurveyRun(params.teamName, title);
  }

  async reopenSurveyRun(params: ReopenSurveyRunParams) {
    const title = params.title ?? DEFAULT_SURVEY_RUN_TITLE;
    await this.driver.reopenSurveyRun(params.teamName, title);
  }

  async confirmReopeningSurveyRunIsNotPossible() {
    await this.driver.confirmReopeningSurveyRunIsNotPossible();
  }

  async viewAssessmentResults(params: ViewAssessmentResultsParams) {
    const title = params.surveyTitle ?? DEFAULT_SURVEY_RUN_TITLE;
    await this.driver.openSurveyRunPage(params.teamName, title);
  }

  async confirmAssessmentResultsDisplayed() {
    await this.driver.confirmAssessmentResultsDisplayed();
  }

  async confirmCapabilityScoresDisplayed() {
    await this.driver.confirmCapabilityScoresDisplayed();
  }

  async confirmOverallSummaryDisplayed() {
    await this.driver.confirmOverallSummaryDisplayed();
  }

  async confirmIndividualResponsesNotVisible() {
    await this.driver.confirmIndividualResponsesNotVisible();
  }

  async confirmAggregatedScoreForCapability(params: ConfirmAggregatedScoreParams) {
    await this.driver.confirmAggregatedScoreForCapability(
      params.capabilityName,
      params.expectedScore,
    );
  }

  async confirmTotalResponsesCount(params: ConfirmTotalResponsesParams) {
    await this.driver.confirmTotalResponsesCount(params.expectedCount);
  }

  async confirmClosingSurveyRunIsNotPossible() {
    await this.driver.confirmClosingSurveyRunIsNotPossible();
  }

  async confirmSurveyNotYetOpen() {
    await this.driver.confirmSurveyNotYetOpen();
  }

  async confirmNoSurveyAvailable() {
    await this.driver.confirmNoSurveyAvailable();
  }

  async attemptToViewLastSurveyRun() {
    await this.driver.navigateToLastSurveyRunPage();
  }

  async confirmSurveyRunClosed() {
    await this.driver.confirmSurveyRunClosed();
  }

  // Capability Profile

  async viewCapabilityProfile(params: ViewCapabilityProfileParams) {
    const title = params.surveyTitle ?? DEFAULT_SURVEY_RUN_TITLE;
    await this.driver.openSurveyRunPage(params.teamName, title);
  }

  async confirmCapabilityProfileVisualizationDisplayed() {
    await this.driver.confirmCapabilityProfileVisualizationDisplayed();
  }

  async confirmMaturityLevelsIdentifiable() {
    await this.driver.confirmMaturityLevelsIdentifiable();
  }

  async accessLatestSurveyRunResults() {
    await this.driver.accessLatestSurveyRunResults();
  }

  async attemptToViewCapabilityProfile() {
    await this.driver.attemptToViewCapabilityProfile();
  }

  async confirmAccessDenied() {
    await this.driver.confirmAccessDenied();
  }

  // Improvement Guidance

  async accessGuidanceForCapability(params: AccessGuidanceParams) {
    await this.driver.accessGuidanceForCapability(params.capabilityName);
  }

  async confirmGuidanceDisplayed(params: ConfirmGuidanceDisplayedParams) {
    await this.driver.confirmGuidanceDisplayed(params.capabilityName);
  }

  async confirmGuidanceText(params: ConfirmGuidanceTextParams) {
    await this.driver.confirmGuidanceText(params.text);
  }

  async confirmGuidanceContainsActionableAdvice() {
    await this.driver.confirmGuidanceContainsActionableAdvice();
  }

  async confirmGuidanceShowsDoraSource() {
    await this.driver.confirmGuidanceShowsDoraSource();
  }
}
