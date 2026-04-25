import { expect, suite, test, vi } from 'vitest';
import type { AssessmentResult } from '@models/aggregates/assessment-result.ts';
import { SurveyRun, SurveyRunResponse } from '@models/aggregates/survey-run.ts';
import type { DoraCapabilitiesService } from '@services/dora-capabilities-service.ts';
import type { SurveyModelService } from '@services/survey-model-service.ts';
import type { AssessmentService } from '@services/assessment-service.ts';
import type { SurveyRunService } from '@services/survey-run-service.ts';
import type { TeamDto, TeamsService } from '@services/teams-service.ts';
import { AuthorizationError } from '@services/authorization-service.ts';
import {
  GetSurveyRunDetailsUseCase,
  SurveyRunDetailsNotFoundError,
} from '@use-cases/get-survey-run-details.ts';

suite('GetSurveyRunDetailsUseCase', () => {
  function createUseCase(overrides?: {
    surveyRunService?: Pick<
      SurveyRunService,
      'getSurveyRun' | 'getSurveyRunsByTeam'
    >;
    teamsService?: Pick<TeamsService, 'getTeam'>;
    surveyModelService?: Pick<SurveyModelService, 'getSurveyModel'>;
    doraCapabilitiesService?: Pick<
      DoraCapabilitiesService,
      'getDoraCapabilitiesByIds'
    >;
    assessmentService?: Pick<AssessmentService, 'getAssessmentResults'>;
  }) {
    const surveyRunService =
      overrides?.surveyRunService ??
      ({
        getSurveyRun: vi.fn().mockResolvedValue(
          SurveyRun.reconstitute(
            'run-1',
            'team-1',
            'model-1',
            'Sprint 1',
            'open',
            [
              SurveyRunResponse.reconstitute('response-1', 'lead-1', [
                { answerValue: 4, comment: 'Solid.' },
                { answerValue: 5, comment: null },
              ]),
            ],
          ),
        ),
        getSurveyRunsByTeam: vi
          .fn()
          .mockResolvedValue([
            SurveyRun.reconstitute(
              'run-1',
              'team-1',
              'model-1',
              'Sprint 1',
              'closed',
              [],
            ),
            SurveyRun.reconstitute(
              'run-2',
              'team-1',
              'model-1',
              'Sprint 2',
              'open',
              [],
            ),
          ]),
      } as Pick<SurveyRunService, 'getSurveyRun' | 'getSurveyRunsByTeam'>);

    const teamsService =
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

    const surveyModelService =
      overrides?.surveyModelService ??
      ({
        getSurveyModel: vi.fn().mockResolvedValue({
          id: 'model-1',
          version: 'v1',
          questions: [
            {
              id: 'question-1',
              doraCapabilityId: 'capability-1',
              questionText: 'How often do you integrate?',
              sortOrder: 1,
            },
            {
              id: 'question-2',
              doraCapabilityId: 'capability-2',
              questionText: 'How quickly do you recover?',
              sortOrder: 2,
            },
          ],
        }),
      } as Pick<SurveyModelService, 'getSurveyModel'>);

    const doraCapabilitiesService =
      overrides?.doraCapabilitiesService ??
      ({
        getDoraCapabilitiesByIds: vi.fn().mockResolvedValue([
          {
            id: 'capability-1',
            slug: 'continuous-integration',
            name: 'Continuous integration',
            description: 'CI',
            doraReference:
              'https://dora.dev/capabilities/continuous-integration/',
            guidance: [],
          },
        ]),
      } as Pick<DoraCapabilitiesService, 'getDoraCapabilitiesByIds'>);

    const assessmentService =
      overrides?.assessmentService ??
      ({
        getAssessmentResults: vi.fn().mockResolvedValue({
          surveyRunId: 'run-1',
          teamId: 'team-1',
          doraCapabilityScores: [],
        } satisfies AssessmentResult),
      } as Pick<AssessmentService, 'getAssessmentResults'>);

    return new GetSurveyRunDetailsUseCase(
      surveyRunService,
      teamsService,
      surveyModelService,
      doraCapabilitiesService,
      assessmentService,
    );
  }

  test('returns details for an open survey run', async () => {
    const useCase = createUseCase();

    const result = await useCase.execute('team-1', 'run-1', 'lead-1');

    expect(result.surveyRun.id).toBe('run-1');
    expect(result.team.name).toBe('Road Runners');
    expect(result.isTeamLead).toBe(true);
    expect(result.questionAnswers).toEqual([
      {
        questionId: 'question-1',
        questionText: 'How often do you integrate?',
        capabilityName: 'Continuous integration',
        answerValue: 4,
        comment: 'Solid.',
      },
      {
        questionId: 'question-2',
        questionText: 'How quickly do you recover?',
        capabilityName: 'Unknown',
        answerValue: 5,
        comment: null,
      },
    ]);
    expect(result.assessmentResult).toBeNull();
    expect(result.assessmentError).toBeUndefined();
    expect(result.hasOtherOpenSurveyRun).toBe(false);
  });

  test('requests dora capabilities by unique ids from the survey model', async () => {
    const getDoraCapabilitiesByIds = vi.fn().mockResolvedValue([]);
    const useCase = createUseCase({
      doraCapabilitiesService: {
        getDoraCapabilitiesByIds,
      },
      surveyModelService: {
        getSurveyModel: vi.fn().mockResolvedValue({
          id: 'model-1',
          version: 'v1',
          questions: [
            {
              id: 'question-1',
              doraCapabilityId: 'capability-2',
              questionText: 'Q1',
              sortOrder: 1,
            },
            {
              id: 'question-2',
              doraCapabilityId: 'capability-1',
              questionText: 'Q2',
              sortOrder: 2,
            },
            {
              id: 'question-3',
              doraCapabilityId: 'capability-2',
              questionText: 'Q3',
              sortOrder: 3,
            },
          ],
        }),
      },
    });

    await useCase.execute('team-1', 'run-1', 'lead-1');

    expect(getDoraCapabilitiesByIds).toHaveBeenCalledWith([
      'capability-2',
      'capability-1',
    ]);
  });

  test('returns assessment results and open-run guard for a closed survey run', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRun: vi
          .fn()
          .mockResolvedValue(
            SurveyRun.reconstitute(
              'run-1',
              'team-1',
              'model-1',
              'Sprint 1',
              'closed',
              [],
            ),
          ),
        getSurveyRunsByTeam: vi
          .fn()
          .mockResolvedValue([
            SurveyRun.reconstitute(
              'run-1',
              'team-1',
              'model-1',
              'Sprint 1',
              'closed',
              [],
            ),
            SurveyRun.reconstitute(
              'run-2',
              'team-1',
              'model-1',
              'Sprint 2',
              'open',
              [],
            ),
          ]),
      },
    });

    const result = await useCase.execute('team-1', 'run-1', 'lead-1');

    expect(result.assessmentResult?.surveyRunId).toBe('run-1');
    expect(result.assessmentError).toBeUndefined();
    expect(result.hasOtherOpenSurveyRun).toBe(true);
  });

  test('does not query sibling survey runs for non-leads on closed survey runs', async () => {
    const getSurveyRunsByTeam = vi.fn();
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRun: vi
          .fn()
          .mockResolvedValue(
            SurveyRun.reconstitute(
              'run-1',
              'team-1',
              'model-1',
              'Sprint 1',
              'closed',
              [],
            ),
          ),
        getSurveyRunsByTeam,
      },
    });

    const result = await useCase.execute('team-1', 'run-1', 'member-1');

    expect(result.isTeamLead).toBe(false);
    expect(result.hasOtherOpenSurveyRun).toBe(false);
    expect(getSurveyRunsByTeam).not.toHaveBeenCalled();
  });

  test('returns an assessment error when loading results fails', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRun: vi
          .fn()
          .mockResolvedValue(
            SurveyRun.reconstitute(
              'run-1',
              'team-1',
              'model-1',
              'Sprint 1',
              'closed',
              [],
            ),
          ),
        getSurveyRunsByTeam: vi.fn().mockResolvedValue([]),
      },
      assessmentService: {
        getAssessmentResults: vi.fn().mockRejectedValue(new Error('boom')),
      },
    });

    const result = await useCase.execute('team-1', 'run-1', 'lead-1');

    expect(result.assessmentResult).toBeNull();
    expect(result.assessmentError).toBe('Failed to load assessment results.');
  });

  test('maps missing survey runs to not found', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRun: vi
          .fn()
          .mockRejectedValue(new Error('Survey run not found')),
        getSurveyRunsByTeam: vi.fn(),
      },
    });

    await expect(
      useCase.execute('team-1', 'missing-run', 'lead-1'),
    ).rejects.toThrow(
      new SurveyRunDetailsNotFoundError('Survey run not found'),
    );
  });

  test('maps missing teams to not found', async () => {
    const useCase = createUseCase({
      teamsService: {
        getTeam: vi.fn().mockRejectedValue(new Error('Team not found')),
      },
    });

    await expect(
      useCase.execute('missing-team', 'run-1', 'lead-1'),
    ).rejects.toThrow(new SurveyRunDetailsNotFoundError('Team not found'));
  });

  test('throws not found when the survey run is not part of the team route', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRun: vi
          .fn()
          .mockResolvedValue(
            SurveyRun.reconstitute(
              'run-1',
              'other-team',
              'model-1',
              'Sprint 1',
              'open',
              [],
            ),
          ),
        getSurveyRunsByTeam: vi.fn(),
      },
    });

    await expect(useCase.execute('team-1', 'run-1', 'lead-1')).rejects.toThrow(
      new SurveyRunDetailsNotFoundError('Survey run not found'),
    );
  });

  test('throws not found when the survey model is missing', async () => {
    const useCase = createUseCase({
      surveyModelService: {
        getSurveyModel: vi.fn().mockResolvedValue(null),
      },
    });

    await expect(useCase.execute('team-1', 'run-1', 'lead-1')).rejects.toThrow(
      new SurveyRunDetailsNotFoundError('Survey model not found'),
    );
  });

  test('propagates authorization errors from survey run access', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRun: vi
          .fn()
          .mockRejectedValue(
            new AuthorizationError('Access denied: not a team member'),
          ),
        getSurveyRunsByTeam: vi.fn(),
      },
    });

    await expect(
      useCase.execute('team-1', 'run-1', 'member-2'),
    ).rejects.toThrow(
      new AuthorizationError('Access denied: not a team member'),
    );
  });
});
