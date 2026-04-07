import { expect, suite, test, vi } from 'vitest';
import { SurveyRun } from '@models/aggregates/survey-run.ts';
import type { SurveyRunService } from '@services/survey-run-service.ts';
import type { TeamDto, TeamsService } from '@services/teams-service.ts';
import { AuthorizationError } from '@services/authorization-service.ts';
import {
  GetTeamOverviewUseCase,
  TeamOverviewNotFoundError,
} from '@use-cases/get-team-overview.ts';

suite('GetTeamOverviewUseCase', () => {
  function createUseCase(overrides?: {
    teamsService?: Pick<TeamsService, 'getTeam'>;
    surveyRunService?: Pick<SurveyRunService, 'getSurveyRunsByTeam'>;
  }) {
    const team =
      overrides?.teamsService ??
      ({
        getTeam: vi.fn().mockResolvedValue({
          id: 'team-1',
          name: 'Road Runners',
          description: 'Delivery team',
          members: [
            {
              userId: 'lead-1',
              userEmail: 'lead@example.com',
              role: 'team-lead',
            },
            {
              userId: 'member-1',
              userEmail: 'member@example.com',
              role: 'regular-member',
            },
          ],
        } satisfies TeamDto),
      } as Pick<TeamsService, 'getTeam'>);

    const surveyRuns =
      overrides?.surveyRunService ??
      ({
        getSurveyRunsByTeam: vi
          .fn()
          .mockResolvedValue([
            SurveyRun.reconstitute(
              'run-1',
              'team-1',
              'model-1',
              'Sprint 1',
              'pending',
              [],
            ),
            SurveyRun.reconstitute(
              'run-2',
              'team-1',
              'model-1',
              'Sprint 2',
              'closed',
              [],
            ),
          ]),
      } as Pick<SurveyRunService, 'getSurveyRunsByTeam'>);

    return new GetTeamOverviewUseCase(team, surveyRuns);
  }

  test('returns the team overview with team lead flag', async () => {
    const useCase = createUseCase();

    const result = await useCase.execute('team-1', 'lead-1');

    expect(result.team.name).toBe('Road Runners');
    expect(result.surveyRuns).toHaveLength(2);
    expect(result.isTeamLead).toBe(true);
  });

  test('returns false for users who are not team leads', async () => {
    const useCase = createUseCase();

    const result = await useCase.execute('team-1', 'member-1');

    expect(result.isTeamLead).toBe(false);
  });

  test('returns an empty survey run list when the team has none', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRunsByTeam: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await useCase.execute('team-1', 'lead-1');

    expect(result.surveyRuns).toEqual([]);
  });

  test('maps missing teams to not found', async () => {
    const useCase = createUseCase({
      teamsService: {
        getTeam: vi.fn().mockRejectedValue(new Error('Team not found')),
      },
    });

    await expect(useCase.execute('missing-team', 'lead-1')).rejects.toThrow(
      new TeamOverviewNotFoundError('Team not found'),
    );
  });

  test('maps missing teams from survey runs lookup to not found', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRunsByTeam: vi
          .fn()
          .mockRejectedValue(new Error('Team not found')),
      },
    });

    await expect(useCase.execute('missing-team', 'lead-1')).rejects.toThrow(
      new TeamOverviewNotFoundError('Team not found'),
    );
  });

  test('propagates authorization errors', async () => {
    const useCase = createUseCase({
      teamsService: {
        getTeam: vi
          .fn()
          .mockRejectedValue(
            new AuthorizationError('Access denied: not a team member'),
          ),
      },
    });

    await expect(useCase.execute('team-1', 'member-2')).rejects.toThrow(
      new AuthorizationError('Access denied: not a team member'),
    );
  });
});
