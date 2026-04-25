import { expect, suite, test, vi } from 'vitest';
import { SurveyRun } from '@models/aggregates/survey-run.ts';
import type { TeamDto, TeamsService } from '@services/teams-service.ts';
import type { SurveyRunService } from '@services/survey-run-service.ts';
import type { AssessmentService } from '@services/assessment-service.ts';
import { AuthorizationError } from '@services/authorization-service.ts';
import {
  GetTeamTrendUseCase,
  TeamTrendNotFoundError,
} from '@use-cases/get-team-trend.ts';

suite('GetTeamTrendUseCase', () => {
  const team: TeamDto = {
    id: 'team-1',
    name: 'Road Runners',
    description: null,
    members: [
      { userId: 'lead-1', userEmail: 'lead@example.com', role: 'team-lead' },
    ],
  };

  function makeRun(id: string, title: string, status: 'open' | 'closed') {
    return SurveyRun.reconstitute(id, 'team-1', 'model-1', title, status, []);
  }

  function makeAssessment(
    surveyRunId: string,
    scores: Array<{ id: string; name: string; score: number | null }>,
  ) {
    return {
      surveyRunId,
      teamId: 'team-1',
      doraCapabilityScores: scores.map((s) => ({
        doraCapabilityId: s.id,
        doraCapabilityName: s.name,
        score: s.score,
        responseCount: s.score === null ? 0 : 1,
      })),
      overallSummary: {
        overallScore: null,
        totalDoraCapabilities: scores.length,
        totalResponses: 0,
      },
    };
  }

  function createUseCase(overrides?: {
    teamsService?: Pick<TeamsService, 'getTeam'>;
    surveyRunService?: Pick<SurveyRunService, 'getSurveyRunsByTeam'>;
    assessmentService?: Pick<
      AssessmentService,
      'getAssessmentResultsForSurveys'
    >;
  }) {
    const teamsService =
      overrides?.teamsService ??
      ({ getTeam: vi.fn().mockResolvedValue(team) } as Pick<
        TeamsService,
        'getTeam'
      >);
    const surveyRunService =
      overrides?.surveyRunService ??
      ({
        getSurveyRunsByTeam: vi.fn().mockResolvedValue([]),
      } as Pick<SurveyRunService, 'getSurveyRunsByTeam'>);
    const assessmentService =
      overrides?.assessmentService ??
      ({
        getAssessmentResultsForSurveys: vi.fn().mockResolvedValue([]),
      } as Pick<AssessmentService, 'getAssessmentResultsForSurveys'>);

    return new GetTeamTrendUseCase(
      teamsService,
      surveyRunService,
      assessmentService,
    );
  }

  test('returns chronological trend data across closed runs', async () => {
    const runs = [
      makeRun('run-3', 'Sprint 3', 'closed'),
      makeRun('run-2', 'Sprint 2', 'closed'),
      makeRun('run-1', 'Sprint 1', 'closed'),
    ];
    const getSurveyRunsByTeam = vi.fn().mockResolvedValue(runs);
    const getAssessmentResultsForRuns = vi
      .fn()
      .mockImplementation((chronological: typeof runs) =>
        Promise.resolve(
          chronological.map((r) =>
            makeAssessment(r.id, [
              {
                id: 'cap-a',
                name: 'Continuous Delivery',
                score: { 'run-1': 4.0, 'run-2': 4.5, 'run-3': 5.1 }[r.id]!,
              },
              {
                id: 'cap-b',
                name: 'Trunk-based Dev',
                score: { 'run-1': 3.0, 'run-2': 3.0, 'run-3': 2.9 }[r.id]!,
              },
            ]),
          ),
        ),
      );

    const useCase = createUseCase({
      surveyRunService: { getSurveyRunsByTeam },
      assessmentService: {
        getAssessmentResultsForSurveys: getAssessmentResultsForRuns,
      },
    });

    const result = await useCase.execute('team-1');

    expect(getSurveyRunsByTeam).toHaveBeenCalledWith('team-1', true, 'closed');
    expect(getAssessmentResultsForRuns).toHaveBeenCalledTimes(1);
    const passedChronological = getAssessmentResultsForRuns.mock
      .calls[0][0] as SurveyRun[];
    expect(passedChronological.map((r) => r.id)).toEqual([
      'run-1',
      'run-2',
      'run-3',
    ]);

    expect(result.surveyCount).toBe(3);
    expect(result.capabilityTrends).toHaveLength(2);
    const capA = result.capabilityTrends.find(
      (c) => c.doraCapabilityId === 'cap-a',
    )!;
    expect(capA.points.map((p) => p.surveyRunTitle)).toEqual([
      'Sprint 1',
      'Sprint 2',
      'Sprint 3',
    ]);
    expect(capA.points.map((p) => p.score)).toEqual([4.0, 4.5, 5.1]);
    expect(capA.latestScore).toBe(5.1);
  });

  test('returns empty trends when no closed runs exist', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRunsByTeam: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await useCase.execute('team-1');

    expect(result.surveyCount).toBe(0);
    expect(result.capabilityTrends).toEqual([]);
  });

  test('represents missing capability scores as null gaps', async () => {
    const runs = [
      makeRun('run-2', 'Sprint 2', 'closed'),
      makeRun('run-1', 'Sprint 1', 'closed'),
    ];
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRunsByTeam: vi.fn().mockResolvedValue(runs),
      },
      assessmentService: {
        getAssessmentResultsForSurveys: vi
          .fn()
          .mockResolvedValue([
            makeAssessment('run-1', [
              { id: 'cap-a', name: 'Continuous Delivery', score: null },
            ]),
            makeAssessment('run-2', [
              { id: 'cap-a', name: 'Continuous Delivery', score: 4.5 },
            ]),
          ]),
      },
    });

    const result = await useCase.execute('team-1');

    expect(result.capabilityTrends[0].points.map((p) => p.score)).toEqual([
      null,
      4.5,
    ]);
    expect(result.capabilityTrends[0].latestScore).toBe(4.5);
  });

  test('propagates authorization errors from team lookup', async () => {
    const useCase = createUseCase({
      teamsService: {
        getTeam: vi
          .fn()
          .mockRejectedValue(
            new AuthorizationError('Access denied: not a team member'),
          ),
      },
    });

    await expect(useCase.execute('team-1')).rejects.toThrow(AuthorizationError);
  });

  test('maps missing teams to TeamTrendNotFoundError', async () => {
    const useCase = createUseCase({
      teamsService: {
        getTeam: vi.fn().mockRejectedValue(new Error('Team not found')),
      },
    });

    await expect(useCase.execute('missing')).rejects.toThrow(
      new TeamTrendNotFoundError('Team not found'),
    );
  });
});
