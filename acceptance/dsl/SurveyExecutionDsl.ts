import { ProtocolDriver } from '../drivers/ProtocolDriver.ts';
import { namespaceName } from './testNamespace.ts';

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

export type AddCommentToQuestionParams = {
  capabilityName: string;
  comment: string;
};

export type ConfirmCommentSavedParams = {
  capabilityName: string;
};

export type ConfirmMyCommentParams = {
  capabilityName: string;
  comment: string;
};

export type ConfirmCommentNotInResultsParams = {
  comment: string;
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
const DEFAULT_SURVEY_RUN_ANSWERS = [1, 2, 3, 4, 5, 4, 3, 2, 1, 2];

export class SurveyExecutionDsl {
  constructor(
    private readonly driver: ProtocolDriver,
    private readonly token: string,
  ) {
  }

  private name(name: string): string {
    return namespaceName(name, this.token);
  }

  async createSurveyRun(params: CreateSurveyRunParams) {
    const title = this.name(params.title ?? DEFAULT_SURVEY_RUN_TITLE);
    await this.driver.createSurveyRun(this.name(params.teamName), title);
  }

  async confirmCreatingSurveyRunNotPossible() {
    await this.driver.confirmCreatingSurveyRunNotPossible();
  }

  async confirmSurveyRunIsListed(params: ConfirmSurveyRunIsListedParams) {
    const title = this.name(params.title ?? DEFAULT_SURVEY_RUN_TITLE);
    await this.driver.confirmSurveyRunIsListed(this.name(params.teamName), title);
  }

  async openSurveyRunPage(params: OpenSurveyRunPageParams) {
    const title = this.name(params.title ?? DEFAULT_SURVEY_RUN_TITLE);
    await this.driver.openSurveyRunPage(this.name(params.teamName), title);
  }

  async confirmSurveyRunCount(params: ConfirmSurveyRunCountParams) {
    await this.driver.confirmSurveyRunCount(params.expectedCount);
  }

  async confirmSurveyRunDetails(params?: ConfirmSurveyRunDetailsParams) {
    const status = params?.status ?? 'pending';
    await this.driver.confirmSurveyRunDetails(status);
  }

  async openSurveyRun(params: OpenSurveyRunParams) {
    const title = this.name(params.title ?? DEFAULT_SURVEY_RUN_TITLE);
    await this.driver.openSurveyRun(this.name(params.teamName), title);
  }

  async confirmAcceptsSurveyResponse(params: ConfirmAcceptsSurveyResponse) {
    const title = this.name(params.title ?? DEFAULT_SURVEY_RUN_TITLE);
    await this.driver.openSurveyRunPage(this.name(params.teamName), title);
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
    const title = this.name(params.surveyTitle ?? DEFAULT_SURVEY_RUN_TITLE);
    const answers = params.answers ?? DEFAULT_SURVEY_RUN_ANSWERS;
    await this.driver.confirmResponseSaved(this.name(params.teamName), title, answers);
  }

  async confirmAllQuestionsHave5PointScale() {
    await this.driver.confirmAllQuestionsHave5PointScale();
  }

  async confirmAllQuestionsAreAnswerable() {
    await this.driver.confirmAllQuestionsAreAnswerable();
  }

  async confirmMyAnswers(params: ConfirmMyAnswersParams) {
    await this.driver.confirmMyAnswers(params.answers);
  }

  async addCommentToQuestion(params: AddCommentToQuestionParams) {
    await this.driver.addCommentToQuestion(params.capabilityName, params.comment);
  }

  async confirmCommentSaved(params: ConfirmCommentSavedParams) {
    await this.driver.confirmCommentSaved(params.capabilityName);
  }

  async confirmMyComment(params: ConfirmMyCommentParams) {
    await this.driver.confirmMyComment(params.capabilityName, params.comment);
  }

  async confirmCommentNotInResults(params: ConfirmCommentNotInResultsParams) {
    await this.driver.confirmCommentNotInResults(params.comment);
  }

  async confirmCannotAnswerSurvey() {
    await this.driver.confirmCannotAnswerSurvey();
  }

  // Assessment Results

  async closeSurveyRun(params: CloseSurveyRunParams) {
    const title = this.name(params.title ?? DEFAULT_SURVEY_RUN_TITLE);
    await this.driver.closeSurveyRun(this.name(params.teamName), title);
  }

  async reopenSurveyRun(params: ReopenSurveyRunParams) {
    const title = this.name(params.title ?? DEFAULT_SURVEY_RUN_TITLE);
    await this.driver.reopenSurveyRun(this.name(params.teamName), title);
  }

  async confirmReopeningSurveyRunIsNotPossible() {
    await this.driver.confirmReopeningSurveyRunIsNotPossible();
  }

  async viewAssessmentResults(params: ViewAssessmentResultsParams) {
    const title = this.name(params.surveyTitle ?? DEFAULT_SURVEY_RUN_TITLE);
    await this.driver.openSurveyRunPage(this.name(params.teamName), title);
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
    const title = this.name(params.surveyTitle ?? DEFAULT_SURVEY_RUN_TITLE);
    await this.driver.openSurveyRunPage(this.name(params.teamName), title);
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

  // Trend View

  async viewTrendView(params: { teamName: string }) {
    await this.driver.openTrendView(this.name(params.teamName));
  }

  async confirmTrendVisualizationDisplayed() {
    await this.driver.confirmTrendVisualizationDisplayed();
  }

  async confirmTrendCardsHaveSurveyCount(params: { expectedSurveyCount: number }) {
    await this.driver.confirmTrendCardsHaveSurveyCount(params.expectedSurveyCount);
  }

  async confirmRunsInChronologicalOrder(params: { expectedTitlesInOrder: string[] }) {
    await this.driver.confirmRunsInChronologicalOrder(
      params.expectedTitlesInOrder.map((title) => this.name(title)),
    );
  }

  async confirmDoraCapabilityImproved(params: {
    doraCapabilityName: string;
    fromRunTitle: string;
    toRunTitle: string;
  }) {
    await this.driver.confirmDoraCapabilityImproved(
      params.doraCapabilityName,
      this.name(params.fromRunTitle),
      this.name(params.toRunTitle),
    );
  }

  async confirmDoraCapabilityDeclined(params: {
    doraCapabilityName: string;
    fromRunTitle: string;
    toRunTitle: string;
  }) {
    await this.driver.confirmDoraCapabilityDeclined(
      params.doraCapabilityName,
      this.name(params.fromRunTitle),
      this.name(params.toRunTitle),
    );
  }

  async confirmDoraCapabilityRemainedUnchanged(params: {
    doraCapabilityName: string;
    fromRunTitle: string;
    toRunTitle: string;
  }) {
    await this.driver.confirmDoraCapabilityRemainedUnchanged(
      params.doraCapabilityName,
      this.name(params.fromRunTitle),
      this.name(params.toRunTitle),
    );
  }

  async attemptToViewTrendView() {
    await this.driver.attemptToViewTrendView();
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

  async openDoraCapabilityInfo() {
    await this.driver.openDoraCapabilityInfo();
  }

  async confirmDoraCapabilityDescriptionVisible() {
    await this.driver.confirmDoraCapabilityDescriptionVisible();
  }

  async confirmDoraCapabilityDoraLinkVisible() {
    await this.driver.confirmDoraCapabilityDoraLinkVisible();
  }
}
