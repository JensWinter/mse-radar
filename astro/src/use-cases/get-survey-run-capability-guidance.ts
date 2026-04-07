import type { SurveyRunService } from '@services/survey-run-service.ts';
import type { AssessmentService } from '@services/assessment-service.ts';
import { SurveyRunNotClosedError } from '@services/assessment-service.ts';
import type {
  GuidanceService,
  TailoredGuidance,
} from '@services/guidance-service.ts';

export type SurveyRunCapabilityGuidance = TailoredGuidance & {
  surveyRunId: string;
  teamId: string;
  surveyTitle: string;
};

export class SurveyRunGuidanceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SurveyRunGuidanceUnavailableError';
  }
}

export class GetSurveyRunCapabilityGuidanceUseCase {
  constructor(
    private readonly surveyRunService: Pick<SurveyRunService, 'getSurveyRun'>,
    private readonly assessmentService: Pick<
      AssessmentService,
      'getCapabilityScore'
    >,
    private readonly guidanceService: Pick<
      GuidanceService,
      'getGuidanceForCapability'
    >,
  ) {}

  async execute(
    surveyRunId: string,
    doraCapabilityId: string,
  ): Promise<SurveyRunCapabilityGuidance> {
    const surveyRun = await this.getSurveyRunOrThrow(surveyRunId);
    const capabilityScore = await this.getCapabilityScoreOrThrow(
      surveyRunId,
      doraCapabilityId,
    );

    const guidance = await this.guidanceService.getGuidanceForCapability(
      doraCapabilityId,
      capabilityScore.score,
    );
    if (!guidance) {
      throw new SurveyRunGuidanceUnavailableError('Capability not found');
    }

    return {
      ...guidance,
      surveyRunId: surveyRun.id,
      teamId: surveyRun.teamId,
      surveyTitle: surveyRun.title,
    };
  }

  private async getSurveyRunOrThrow(surveyRunId: string) {
    try {
      return await this.surveyRunService.getSurveyRun(surveyRunId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Survey run not found') {
        throw new SurveyRunGuidanceUnavailableError('Survey run not found');
      }

      throw error;
    }
  }

  private async getCapabilityScoreOrThrow(
    surveyRunId: string,
    doraCapabilityId: string,
  ) {
    try {
      const capabilityScore = await this.assessmentService.getCapabilityScore(
        surveyRunId,
        doraCapabilityId,
      );

      if (!capabilityScore) {
        throw new SurveyRunGuidanceUnavailableError(
          'Capability is not part of this survey run',
        );
      }

      if (capabilityScore.score === null) {
        throw new SurveyRunGuidanceUnavailableError(
          'Capability score is not available for this survey run',
        );
      }

      return capabilityScore as typeof capabilityScore & { score: number };
    } catch (error) {
      if (error instanceof SurveyRunNotClosedError) {
        throw new SurveyRunGuidanceUnavailableError(
          'Guidance is only available for closed survey runs',
        );
      }

      throw error;
    }
  }
}
