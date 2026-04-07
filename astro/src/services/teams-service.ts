import { Team, type TeamMemberRole } from '@models/aggregates/team.ts';
import type { TeamsRepository } from '@database/teams-repository.ts';
import type { UsersRepository } from '@database/users-repository.ts';
import type { IAuthorizationService } from '@services/authorization-service.ts';

export class TeamNameAlreadyExistsError extends Error {
  constructor(teamName: string) {
    super(`Team name already exists: ${teamName}`);
    this.name = 'TeamNameAlreadyExistsError';
  }
}

export class UserNotFoundError extends Error {
  constructor(userEmail: string) {
    super(`No registered user found with email: ${userEmail}`);
    this.name = 'UserNotFoundError';
  }
}

export class TeamsService {
  constructor(
    private readonly authorizationService: IAuthorizationService,
    private readonly teamsRepository: TeamsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createTeam(name: string, description: string | null) {
    await this.ensureTeamNameDoesNotExist(name);

    const teamId = crypto.randomUUID();
    const team = new Team(teamId, name, description);
    team.addMember(this.authorizationService.currentUser, 'team-lead');
    await this.teamsRepository.save(team);

    return teamId;
  }

  async getTeam(teamId: string) {
    const team = await this.getTeamOrThrow(teamId);

    await this.authorizationService.assertTeamMember(team);

    return this.toDto(team);
  }

  async getAllTeams(userId: string) {
    const teams = await this.teamsRepository.getAllByMembership(userId);
    return teams.map((team) => this.toDto(team));
  }

  async addMemberToTeam(teamId: string, userEmail: string) {
    const team = await this.getTeamOrThrow(teamId);

    await this.authorizationService.assertTeamLead(team);

    const user = await this.getUserOrThrow(userEmail);
    team.addMember(user, 'regular-member');
    await this.teamsRepository.save(team);
  }

  async removeMemberFromTeam(teamId: string, userEmail: string) {
    const team = await this.getTeamOrThrow(teamId);

    await this.authorizationService.assertTeamLead(team);

    const user = await this.getUserOrThrow(userEmail);
    team.removeMember(user.id);
    await this.teamsRepository.save(team);
  }

  async updateTeam(
    teamId: string,
    name: string,
    description: string | null,
  ): Promise<void> {
    const team = await this.getTeamOrThrow(teamId);

    await this.authorizationService.assertTeamLead(team);

    if (team.name !== name) {
      await this.ensureTeamNameDoesNotExist(name);
    }

    team.name = name;
    team.description = description;

    await this.teamsRepository.save(team);
  }

  async changeMemberRole(
    teamId: string,
    userEmail: string,
    newRole: TeamMemberRole,
  ): Promise<void> {
    const team = await this.getTeamOrThrow(teamId);

    await this.authorizationService.assertTeamLead(team);

    const user = await this.getUserOrThrow(userEmail);
    team.changeMemberRole(user.id, newRole);
    await this.teamsRepository.save(team);
  }

  private async ensureTeamNameDoesNotExist(name: string) {
    const teamNameExists = await this.teamsRepository.existsByName(name);
    if (teamNameExists) {
      throw new TeamNameAlreadyExistsError(name);
    }
  }

  private async getUserOrThrow(userEmail: string) {
    const user = await this.usersRepository.findByEmail(userEmail);
    if (!user) {
      throw new UserNotFoundError(userEmail);
    }

    return user;
  }

  private async getTeamOrThrow(teamId: string) {
    const team = await this.teamsRepository.getById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    return team;
  }

  private toDto(team: Team): TeamDto {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      members: team.members.map((member) => ({
        userId: member.userId,
        userEmail: member.userEmail,
        role: member.role,
      })),
    };
  }
}

export type TeamDto = {
  id: string;
  name: string;
  description: string | null;
  members: TeamMemberDto[];
};

export type TeamMemberDto = {
  userId: string;
  userEmail: string;
  role: string;
};
