import {
  type AnswerValue,
  SurveyRun,
  type SurveyRunStatus,
} from '@models/aggregates/survey-run.ts';
import type {
  GetAllByTeamIdOptions,
  SurveyRunRepository,
} from '@database/survey-run-repository.ts';
import type { TeamsRepository } from '@database/teams-repository.ts';
import type { IAuthorizationService } from '@services/authorization-service.ts';

export class SurveyRunService {
  constructor(
    private readonly authorizationService: IAuthorizationService,
    private readonly surveyRunRepository: SurveyRunRepository,
    private readonly teamsRepository: TeamsRepository,
  ) {}

  async createSurveyRun(teamId: string, surveyModelId: string, title: string) {
    const team = await this.getTeamOrThrow(teamId);

    await this.authorizationService.assertTeamLead(team);

    const surveyRunId = crypto.randomUUID();
    const surveyRun = new SurveyRun(surveyRunId, teamId, surveyModelId, title);
    await this.surveyRunRepository.save(surveyRun);

    return surveyRunId;
  }

  async getSurveyRunsByTeam(
    teamId: string,
    includeResponses: boolean = false,
    status: SurveyRunStatus | undefined = undefined,
  ) {
    const team = await this.getTeamOrThrow(teamId);

    await this.authorizationService.assertTeamMember(team);

    const options: GetAllByTeamIdOptions = { includeResponses, status };
    return await this.surveyRunRepository.getAllByTeamId(teamId, options);
  }

  async getSurveyRun(surveyRunId: string) {
    const surveyRun = await this.getSurveyRunOrThrow(surveyRunId);

    await this.authorizationService.assertCanAccessSurveyRun(surveyRun);

    return surveyRun;
  }

  async openSurveyRun(surveyRunId: string) {
    const surveyRun = await this.getSurveyRunOrThrow(surveyRunId);

    await this.authorizationService.assertCanManageSurveyRun(surveyRun);

    surveyRun.open();
    await this.surveyRunRepository.save(surveyRun);
  }

  async closeSurveyRun(surveyRunId: string) {
    const surveyRun = await this.getSurveyRunOrThrow(surveyRunId);

    await this.authorizationService.assertCanManageSurveyRun(surveyRun);

    surveyRun.close();
    await this.surveyRunRepository.save(surveyRun);
  }

  async reopenSurveyRun(surveyRunId: string) {
    const surveyRun = await this.getSurveyRunOrThrow(surveyRunId);

    await this.authorizationService.assertCanManageSurveyRun(surveyRun);

    // Check if there's already an open survey run for this team
    const teamSurveyRuns = await this.surveyRunRepository.getAllByTeamId(
      surveyRun.teamId,
    );
    const hasOpenSurveyRun = teamSurveyRuns.some(
      (sr) => sr.id !== surveyRunId && sr.status === 'open',
    );
    if (hasOpenSurveyRun) {
      throw new Error(
        'Cannot reopen survey run: another survey run is already open for this team',
      );
    }

    surveyRun.reopen();
    await this.surveyRunRepository.save(surveyRun);
  }

  async saveAnswer(
    surveyRunId: string,
    questionIndex: number,
    answerValue: AnswerValue | null,
  ) {
    const surveyRun = await this.getSurveyRunOrThrow(surveyRunId);
    await this.authorizationService.assertCanSubmitSurveyResponse(surveyRun);
    const response = surveyRun.initializeResponse(
      this.authorizationService.currentUser,
    );
    response.updateAnswerValue(questionIndex, answerValue);
    await this.surveyRunRepository.save(surveyRun);
  }

  async saveComment(
    surveyRunId: string,
    questionIndex: number,
    comment: string,
  ) {
    const surveyRun = await this.getSurveyRunOrThrow(surveyRunId);
    await this.authorizationService.assertCanSubmitSurveyResponse(surveyRun);
    const response = surveyRun.initializeResponse(
      this.authorizationService.currentUser,
    );
    response.updateComment(questionIndex, comment);
    await this.surveyRunRepository.save(surveyRun);
  }

  private async getTeamOrThrow(teamId: string) {
    const team = await this.teamsRepository.getById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    return team;
  }

  private async getSurveyRunOrThrow(surveyRunId: string) {
    const surveyRun = await this.surveyRunRepository.getById(surveyRunId);
    if (!surveyRun) {
      throw new Error('Survey run not found');
    }
    return surveyRun;
  }
}
