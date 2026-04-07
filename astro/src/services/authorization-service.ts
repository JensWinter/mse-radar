import type { User } from '@models/aggregates/user.ts';
import type { TeamsRepository } from '@database/teams-repository.ts';
import type { Team } from '@models/aggregates/team.ts';
import type { SurveyRun } from '@models/aggregates/survey-run.ts';

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export interface IAuthorizationService {
  readonly currentUser: User;
  assertTeamMember(team: Team): Promise<void>;
  assertTeamLead(team: Team): Promise<void>;
  assertCanAccessSurveyRun(surveyRun: SurveyRun): Promise<void>;
  assertCanManageSurveyRun(surveyRun: SurveyRun): Promise<void>;
  assertCanSubmitSurveyResponse(surveyRun: SurveyRun): Promise<void>;
}

export class AuthorizationService implements IAuthorizationService {
  constructor(
    public readonly currentUser: User,
    private readonly teamsRepository: TeamsRepository,
  ) {}

  async assertTeamMember(team: Team): Promise<void> {
    const isMember = team.members.some(
      (member) => member.userId === this.currentUser.id,
    );
    if (!isMember) {
      throw new AuthorizationError('Access denied: not a team member');
    }
  }

  async assertTeamLead(team: Team): Promise<void> {
    const isTeamLead = team.members.some(
      (member) =>
        member.userId === this.currentUser.id && member.role === 'team-lead',
    );
    if (!isTeamLead) {
      throw new AuthorizationError('Access denied: team lead role required');
    }
  }

  async assertCanAccessSurveyRun(surveyRun: SurveyRun): Promise<void> {
    const team = await this.teamsRepository.getById(surveyRun.teamId);
    if (!team) {
      throw new AuthorizationError('Team not found');
    }

    await this.assertTeamMember(team);
  }

  async assertCanManageSurveyRun(surveyRun: SurveyRun): Promise<void> {
    const team = await this.teamsRepository.getById(surveyRun.teamId);
    if (!team) {
      throw new AuthorizationError('Team not found');
    }

    await this.assertTeamLead(team);
  }

  async assertCanSubmitSurveyResponse(surveyRun: SurveyRun): Promise<void> {
    const team = await this.teamsRepository.getById(surveyRun.teamId);
    if (!team) {
      throw new AuthorizationError('Team not found');
    }

    await this.assertTeamMember(team);
  }
}
