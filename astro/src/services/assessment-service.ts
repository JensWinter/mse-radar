import type { SurveyRunRepository } from '@database/survey-run-repository.ts';
import type { SurveyModelRepository } from '@database/survey-model-repository.ts';
import type { DoraCapabilityRepository } from '@database/dora-capability-repository.ts';
import type {
  AssessmentResult,
  DoraCapabilityScore,
} from '@models/aggregates/assessment-result.ts';
import type { SurveyRun } from '@models/aggregates/survey-run.ts';
import type { SurveyModel } from '@models/aggregates/survey-model.ts';
import type { DoraCapability } from '@models/aggregates/dora-capability.ts';

export class AssessmentService {
  constructor(
    private readonly surveyRunRepository: SurveyRunRepository,
    private readonly surveyModelRepository: SurveyModelRepository,
    private readonly doraCapabilityRepository: DoraCapabilityRepository,
  ) {}

  async getAssessmentResults(
    surveyRunId: string,
  ): Promise<AssessmentResult | null> {
    const surveyRun = await this.surveyRunRepository.getById(surveyRunId);
    if (!surveyRun) {
      return null;
    }

    if (surveyRun.status !== 'closed') {
      throw new SurveyRunNotClosedError(
        'Assessment results are only available for closed survey runs',
      );
    }

    const surveyModel = await this.surveyModelRepository.getById(
      surveyRun.surveyModelId,
    );
    if (!surveyModel) {
      throw new Error('Survey model not found');
    }

    const doraCapabilities = await this.doraCapabilityRepository.getAll();

    const doraCapabilityScores = this.calculateDoraCapabilityScores(
      surveyRun,
      surveyModel,
      doraCapabilities,
    );

    return {
      surveyRunId: surveyRun.id,
      teamId: surveyRun.teamId,
      doraCapabilityScores,
    };
  }

  async getAssessmentResultsForSurveys(
    surveyRuns: SurveyRun[],
  ): Promise<AssessmentResult[]> {
    if (surveyRuns.some((run) => run.status !== 'closed')) {
      throw new SurveyRunNotClosedError(
        'Assessment results are only available for closed survey runs',
      );
    }

    if (surveyRuns.length === 0) {
      return [];
    }

    const distinctModelIds = [
      ...new Set(surveyRuns.map((r) => r.surveyModelId)),
    ];
    const surveyModels = new Map<string, SurveyModel>();
    for (const modelId of distinctModelIds) {
      const model = await this.surveyModelRepository.getById(modelId);
      if (!model) {
        throw new Error('Survey model not found');
      }
      surveyModels.set(modelId, model);
    }

    const doraCapabilities = await this.doraCapabilityRepository.getAll();

    return surveyRuns.map((run) => {
      const surveyModel = surveyModels.get(run.surveyModelId)!;
      const doraCapabilityScores = this.calculateDoraCapabilityScores(
        run,
        surveyModel,
        doraCapabilities,
      );

      return {
        surveyRunId: run.id,
        teamId: run.teamId,
        doraCapabilityScores,
      };
    });
  }

  async getCapabilityScore(
    surveyRunId: string,
    doraCapabilityId: string,
  ): Promise<DoraCapabilityScore | null> {
    const assessmentResult = await this.getAssessmentResults(surveyRunId);
    if (!assessmentResult) {
      return null;
    }

    return (
      assessmentResult.doraCapabilityScores.find(
        (score) => score.doraCapabilityId === doraCapabilityId,
      ) ?? null
    );
  }

  private calculateDoraCapabilityScores(
    surveyRun: SurveyRun,
    surveyModel: SurveyModel,
    doraCapabilities: DoraCapability[],
  ): DoraCapabilityScore[] {
    const questions = surveyModel.questions;
    const responses = surveyRun.responses;

    return questions.map((question, questionIndex) => {
      const answersForQuestion = responses
        .map((r) => r.answers[questionIndex]?.answerValue)
        .filter((v) => v !== null && v !== undefined);

      const sum = answersForQuestion.reduce((a, b) => a + b, 0);
      const mean =
        answersForQuestion.length === 0
          ? null
          : sum / answersForQuestion.length;

      const doraCapability = doraCapabilities.find(
        (c) => c.id === question.doraCapabilityId,
      );

      return {
        doraCapabilityId: question.doraCapabilityId,
        doraCapabilityName: doraCapability?.name ?? 'Unknown',
        score: mean === null ? null : Math.round(mean * 10) / 10,
        responseCount: answersForQuestion.length,
      };
    });
  }
}

export class SurveyRunNotClosedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SurveyRunNotClosedError';
  }
}
