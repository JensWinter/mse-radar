import type { TeamDto } from '@services/teams-service.ts';
import type { SurveyRun } from '@models/aggregates/survey-run.ts';
import type { TeamsService } from '@services/teams-service.ts';
import type { SurveyRunService } from '@services/survey-run-service.ts';

export type TeamOverview = {
  team: TeamDto;
  surveyRuns: SurveyRun[];
  isTeamLead: boolean;
};

export class TeamOverviewNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeamOverviewNotFoundError';
  }
}

export class GetTeamOverviewUseCase {
  constructor(
    private readonly teamsService: Pick<TeamsService, 'getTeam'>,
    private readonly surveyRunService: Pick<
      SurveyRunService,
      'getSurveyRunsByTeam'
    >,
  ) {}

  async execute(teamId: string, currentUserId: string): Promise<TeamOverview> {
    const team = await this.getTeamOrThrow(teamId);
    const surveyRuns = await this.getSurveyRunsOrThrow(teamId);

    return {
      team,
      surveyRuns,
      isTeamLead: team.members.some(
        (member) =>
          member.userId === currentUserId && member.role === 'team-lead',
      ),
    };
  }

  private async getTeamOrThrow(teamId: string) {
    try {
      return await this.teamsService.getTeam(teamId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Team not found') {
        throw new TeamOverviewNotFoundError('Team not found');
      }

      throw error;
    }
  }

  private async getSurveyRunsOrThrow(teamId: string) {
    try {
      return await this.surveyRunService.getSurveyRunsByTeam(teamId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Team not found') {
        throw new TeamOverviewNotFoundError('Team not found');
      }

      throw error;
    }
  }
}
