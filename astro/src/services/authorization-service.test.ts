import { expect, suite, test, vi } from 'vitest';
import {
  AuthorizationService,
  AuthorizationError,
} from '@services/authorization-service.ts';
import type { TeamsRepository } from '@database/teams-repository.ts';
import { User } from '@models/aggregates/user.ts';
import { Team, TeamMember } from '@models/aggregates/team.ts';
import { SurveyRun } from '@models/aggregates/survey-run.ts';

function createMockUser(id: string = 'user-1'): User {
  return User.reconstitute(id, 'user@example.com');
}

function createMockTeam(
  teamId: string,
  members: { userId: string; role: 'team-lead' | 'regular-member' }[],
): Team {
  const teamMembers = members.map(
    (m, index) =>
      new TeamMember(
        `member-${index}`,
        teamId,
        m.userId,
        `${m.userId}@example.com`,
        m.role,
      ),
  );
  return Team.reconstitute(teamId, 'Test Team', 'Description', teamMembers);
}

function createMockSurveyRun(surveyRunId: string, teamId: string): SurveyRun {
  return SurveyRun.reconstitute(
    surveyRunId,
    teamId,
    'survey-model-1',
    'Test Survey',
    'pending',
    [],
  );
}

suite('AuthorizationService', () => {
  suite('assertTeamMember()', () => {
    test('allows access when user is a team member', async () => {
      // Arrange
      const user = createMockUser('user-1');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'regular-member' },
      ]);
      const mockTeamsRepo = {} as TeamsRepository;
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert - should not throw
      await expect(authService.assertTeamMember(team)).resolves.toBeUndefined();
    });

    test('allows access when user is a team lead', async () => {
      // Arrange
      const user = createMockUser('user-1');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'team-lead' },
      ]);
      const mockTeamsRepo = {} as TeamsRepository;
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert - should not throw
      await expect(authService.assertTeamMember(team)).resolves.toBeUndefined();
    });

    test('throws AuthorizationError when user is not a team member', async () => {
      // Arrange
      const user = createMockUser('user-2');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'team-lead' },
      ]);
      const mockTeamsRepo = {} as TeamsRepository;
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert
      await expect(authService.assertTeamMember(team)).rejects.toThrowError(
        AuthorizationError,
      );
      await expect(authService.assertTeamMember(team)).rejects.toThrowError(
        'Access denied: not a team member',
      );
    });
  });

  suite('assertTeamLead()', () => {
    test('allows access when user is a team lead', async () => {
      // Arrange
      const user = createMockUser('user-1');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'team-lead' },
      ]);
      const mockTeamsRepo = {} as TeamsRepository;
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert - should not throw
      await expect(authService.assertTeamLead(team)).resolves.toBeUndefined();
    });

    test('throws AuthorizationError when user is a regular member', async () => {
      // Arrange
      const user = createMockUser('user-1');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'regular-member' },
      ]);
      const mockTeamsRepo = {} as TeamsRepository;
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert
      await expect(authService.assertTeamLead(team)).rejects.toThrowError(
        AuthorizationError,
      );
      await expect(authService.assertTeamLead(team)).rejects.toThrowError(
        'Access denied: team lead role required',
      );
    });

    test('throws AuthorizationError when user is not a team member', async () => {
      // Arrange
      const user = createMockUser('user-2');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'team-lead' },
      ]);
      const mockTeamsRepo = {} as TeamsRepository;
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert
      await expect(authService.assertTeamLead(team)).rejects.toThrowError(
        AuthorizationError,
      );
    });
  });

  suite('assertCanAccessSurveyRun()', () => {
    test('allows access when user is a member of the survey team', async () => {
      // Arrange
      const user = createMockUser('user-1');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'regular-member' },
      ]);
      const surveyRun = createMockSurveyRun('survey-1', 'team-1');
      const mockTeamsRepo: TeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        getAll: vi.fn(),
        getAllByMembership: vi.fn(),
        save: vi.fn(),
        existsByName: vi.fn(),
        deleteById: vi.fn(),
      };
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert - should not throw
      await expect(
        authService.assertCanAccessSurveyRun(surveyRun),
      ).resolves.toBeUndefined();
    });

    test('throws AuthorizationError when user is not a member of the survey team', async () => {
      // Arrange
      const user = createMockUser('user-2');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'team-lead' },
      ]);
      const surveyRun = createMockSurveyRun('survey-1', 'team-1');
      const mockTeamsRepo: TeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        getAll: vi.fn(),
        getAllByMembership: vi.fn(),
        save: vi.fn(),
        existsByName: vi.fn(),
        deleteById: vi.fn(),
      };
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert
      await expect(
        authService.assertCanAccessSurveyRun(surveyRun),
      ).rejects.toThrowError(AuthorizationError);
    });
  });

  suite('assertCanManageSurveyRun()', () => {
    test('allows access when user is a team lead of the survey team', async () => {
      // Arrange
      const user = createMockUser('user-1');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'team-lead' },
      ]);
      const surveyRun = createMockSurveyRun('survey-1', 'team-1');
      const mockTeamsRepo: TeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        getAll: vi.fn(),
        getAllByMembership: vi.fn(),
        save: vi.fn(),
        existsByName: vi.fn(),
        deleteById: vi.fn(),
      };
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert - should not throw
      await expect(
        authService.assertCanManageSurveyRun(surveyRun),
      ).resolves.toBeUndefined();
    });

    test('throws AuthorizationError when user is a regular member of the survey team', async () => {
      // Arrange
      const user = createMockUser('user-1');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'regular-member' },
      ]);
      const surveyRun = createMockSurveyRun('survey-1', 'team-1');
      const mockTeamsRepo: TeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        getAll: vi.fn(),
        getAllByMembership: vi.fn(),
        save: vi.fn(),
        existsByName: vi.fn(),
        deleteById: vi.fn(),
      };
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert
      await expect(
        authService.assertCanManageSurveyRun(surveyRun),
      ).rejects.toThrowError(AuthorizationError);
    });
  });

  suite('assertCanSubmitSurveyResponse()', () => {
    test('allows access when user is a member of the survey team', async () => {
      // Arrange
      const user = createMockUser('user-1');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'regular-member' },
      ]);
      const surveyRun = createMockSurveyRun('survey-1', 'team-1');
      const mockTeamsRepo: TeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        getAll: vi.fn(),
        getAllByMembership: vi.fn(),
        save: vi.fn(),
        existsByName: vi.fn(),
        deleteById: vi.fn(),
      };
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert - should not throw
      await expect(
        authService.assertCanSubmitSurveyResponse(surveyRun),
      ).resolves.toBeUndefined();
    });

    test('throws AuthorizationError when user is not a member of the survey team', async () => {
      // Arrange
      const user = createMockUser('user-2');
      const team = createMockTeam('team-1', [
        { userId: 'user-1', role: 'team-lead' },
      ]);
      const surveyRun = createMockSurveyRun('survey-1', 'team-1');
      const mockTeamsRepo: TeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        getAll: vi.fn(),
        getAllByMembership: vi.fn(),
        save: vi.fn(),
        existsByName: vi.fn(),
        deleteById: vi.fn(),
      };
      const authService = new AuthorizationService(user, mockTeamsRepo);

      // Act & Assert
      await expect(
        authService.assertCanSubmitSurveyResponse(surveyRun),
      ).rejects.toThrowError(AuthorizationError);
    });
  });
});
