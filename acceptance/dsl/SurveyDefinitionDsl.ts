import { ProtocolDriver } from '../drivers/ProtocolDriver.ts';

const DEFAULT_SURVEY_VERSION = 'v1.0';

export type OpenSurveyModelParams = {
  version?: string;
};

export type ConfirmQuestionsMapToDoraCapabilitiesParams = {
  questions: {
    questionText: string;
    doraCapabilityName: string;
    doraCapabilityDescription: string;
  }[];
};

export type ConfirmQuestionsShowDoraCapabilityDescription = {
  questions: {
    questionText: string;
    doraCapabilityName: string;
    doraCapabilityDescription: string;
  }[];
};

export type ConfirmAllDoraCapabilitesAreCoveredParams = {
  questions: {
    questionText: string;
    doraCapabilityName: string;
    doraCapabilityDescription: string;
  }[];
};

export class SurveyDefinitionDsl {
  constructor(private readonly driver: ProtocolDriver) {
  }

  async openSurveyModel(params?: OpenSurveyModelParams) {
    const version = params?.version ?? DEFAULT_SURVEY_VERSION;
    await this.driver.openSurveyModel(version);
  }

  async readSurveyQuestions() {
    return await this.driver.parseSurveyQuestions();
  }

  async confirmQuestionsMapToDoraCapabilities(params: ConfirmQuestionsMapToDoraCapabilitiesParams) {
    await this.driver.confirmQuestionsMapToDoraCapabilities(params.questions);
  }

  async confirmQuestionsShowDoraCapabilityDescription(
    params: ConfirmQuestionsShowDoraCapabilityDescription,
  ) {
    await this.driver.confirmQuestionIndicatesDoraCapability(params.questions);
  }

  async confirmAllDoraCapabilitiesAreCovered(params: ConfirmAllDoraCapabilitesAreCoveredParams) {
    const doraCapabilityNames = params.questions.map((question) => question.doraCapabilityName);
    await this.driver.confirmAllDoraCapabilitiesAreCovered(doraCapabilityNames);
  }
}
