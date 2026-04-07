import type { SurveyModelRepository } from '@database/survey-model-repository.ts';
import type { SurveyModel } from '@models/aggregates/survey-model.ts';

export class SurveyModelService {
  constructor(private readonly surveyModelRepository: SurveyModelRepository) {}

  async getAllSurveyModels() {
    const models = await this.surveyModelRepository.getAll();
    return models.map((model) => this.toDto(model));
  }

  async getSurveyModel(surveyModelId: string) {
    const model = await this.surveyModelRepository.getById(surveyModelId);
    return model ? this.toDto(model) : null;
  }

  async getSurveyModelByVersion(version: string) {
    const model = await this.surveyModelRepository.getByVersion(version);
    return model ? this.toDto(model) : null;
  }

  private toDto(surveyModel: SurveyModel): SurveyModelDto {
    return {
      id: surveyModel.id,
      version: surveyModel.version,
      questions: surveyModel.questions.map((question) => ({
        id: question.id,
        doraCapabilityId: question.doraCapabilityId,
        questionText: question.questionText,
        sortOrder: question.sortOrder,
      })),
    };
  }
}

export type SurveyModelDto = {
  id: string;
  version: string;
  questions: SurveyQuestionDto[];
};

export type SurveyQuestionDto = {
  id: string;
  doraCapabilityId: string;
  questionText: string;
  sortOrder: number;
};
