import type { QuestionAnswer } from '@components/survey-run/types.ts';
import type { AssessmentResult } from '@models/aggregates/assessment-result.ts';
import type { SurveyRun } from '@models/aggregates/survey-run.ts';
import type { DoraCapabilitiesService } from '@services/dora-capabilities-service.ts';
import type { SurveyModelService } from '@services/survey-model-service.ts';
import type { AssessmentService } from '@services/assessment-service.ts';
import type { SurveyRunService } from '@services/survey-run-service.ts';
import type { TeamDto, TeamsService } from '@services/teams-service.ts';

export type SurveyRunDetails = {
  surveyRun: SurveyRun;
  team: TeamDto;
  isTeamLead: boolean;
  questionAnswers: QuestionAnswer[];
  assessmentResult: AssessmentResult | null;
  assessmentError?: string;
  hasOtherOpenSurveyRun: boolean;
};

export class SurveyRunDetailsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SurveyRunDetailsNotFoundError';
  }
}

export class GetSurveyRunDetailsUseCase {
  constructor(
    private readonly surveyRunService: Pick<
      SurveyRunService,
      'getSurveyRun' | 'getSurveyRunsByTeam'
    >,
    private readonly teamsService: Pick<TeamsService, 'getTeam'>,
    private readonly surveyModelService: Pick<
      SurveyModelService,
      'getSurveyModel'
    >,
    private readonly doraCapabilitiesService: Pick<
      DoraCapabilitiesService,
      'getDoraCapabilitiesByIds'
    >,
    private readonly assessmentService: Pick<
      AssessmentService,
      'getAssessmentResults'
    >,
  ) {}

  async execute(
    teamId: string,
    surveyRunId: string,
    currentUserId: string,
  ): Promise<SurveyRunDetails> {
    const surveyRun = await this.getSurveyRunOrThrow(surveyRunId);
    const team = await this.getTeamOrThrow(teamId);

    if (surveyRun.teamId !== teamId) {
      throw new SurveyRunDetailsNotFoundError('Survey run not found');
    }

    const isTeamLead = team.members.some(
      (member) =>
        member.userId === currentUserId && member.role === 'team-lead',
    );
    const questionAnswers = await this.getQuestionAnswers(
      surveyRun,
      currentUserId,
    );
    const hasOtherOpenSurveyRun =
      surveyRun.status === 'closed' && isTeamLead
        ? await this.hasOtherOpenSurveyRun(teamId, surveyRunId)
        : false;

    const { assessmentResult, assessmentError } =
      surveyRun.status === 'closed'
        ? await this.getAssessmentState(surveyRunId)
        : { assessmentResult: null, assessmentError: undefined };

    return {
      surveyRun,
      team,
      isTeamLead,
      questionAnswers,
      assessmentResult,
      assessmentError,
      hasOtherOpenSurveyRun,
    };
  }

  private async getSurveyRunOrThrow(surveyRunId: string) {
    try {
      return await this.surveyRunService.getSurveyRun(surveyRunId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Survey run not found') {
        throw new SurveyRunDetailsNotFoundError('Survey run not found');
      }

      throw error;
    }
  }

  private async getTeamOrThrow(teamId: string) {
    try {
      return await this.teamsService.getTeam(teamId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Team not found') {
        throw new SurveyRunDetailsNotFoundError('Team not found');
      }

      throw error;
    }
  }

  private async getQuestionAnswers(
    surveyRun: SurveyRun,
    currentUserId: string,
  ): Promise<QuestionAnswer[]> {
    const surveyModel = await this.surveyModelService.getSurveyModel(
      surveyRun.surveyModelId,
    );
    if (!surveyModel) {
      throw new SurveyRunDetailsNotFoundError('Survey model not found');
    }

    const doraCapabilityIds = [
      ...new Set(
        surveyModel.questions.map((question) => question.doraCapabilityId),
      ),
    ];
    const doraCapabilities =
      await this.doraCapabilitiesService.getDoraCapabilitiesByIds(
        doraCapabilityIds,
      );
    const capabilityNamesById = new Map(
      doraCapabilities.map((capability) => [capability.id, capability.name]),
    );
    const userResponse = surveyRun.responses.find(
      (response) => response.respondentId === currentUserId,
    );

    return surveyModel.questions.map((question, index) => ({
      questionId: question.id,
      questionText: question.questionText,
      capabilityName:
        capabilityNamesById.get(question.doraCapabilityId) ?? 'Unknown',
      answerValue: userResponse?.answers[index]?.answerValue ?? null,
      comment: userResponse?.answers[index]?.comment ?? null,
    }));
  }

  private async hasOtherOpenSurveyRun(teamId: string, surveyRunId: string) {
    try {
      const surveyRuns =
        await this.surveyRunService.getSurveyRunsByTeam(teamId);

      return surveyRuns.some(
        (surveyRun) =>
          surveyRun.id !== surveyRunId && surveyRun.status === 'open',
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Team not found') {
        throw new SurveyRunDetailsNotFoundError('Team not found');
      }

      throw error;
    }
  }

  private async getAssessmentState(surveyRunId: string) {
    try {
      return {
        assessmentResult:
          await this.assessmentService.getAssessmentResults(surveyRunId),
        assessmentError: undefined,
      };
    } catch {
      return {
        assessmentResult: null,
        assessmentError: 'Failed to load assessment results.',
      };
    }
  }
}
