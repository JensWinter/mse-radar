import { expect, suite, test, vi } from 'vitest';
import { SurveyRun } from '@models/aggregates/survey-run.ts';
import type { SurveyRunService } from '@services/survey-run-service.ts';
import type { AssessmentService } from '@services/assessment-service.ts';
import { SurveyRunNotClosedError } from '@services/assessment-service.ts';
import type {
  GuidanceService,
  TailoredGuidance,
} from '@services/guidance-service.ts';
import { AuthorizationError } from '@services/authorization-service.ts';
import {
  GetSurveyRunCapabilityGuidanceUseCase,
  SurveyRunGuidanceUnavailableError,
} from '@use-cases/get-survey-run-capability-guidance.ts';

suite('GetSurveyRunCapabilityGuidanceUseCase', () => {
  function createUseCase(overrides?: {
    surveyRunService?: Pick<SurveyRunService, 'getSurveyRun'>;
    assessmentService?: Pick<AssessmentService, 'getCapabilityScore'>;
    guidanceService?: Pick<GuidanceService, 'getGuidanceForCapability'>;
  }) {
    const surveyRunService =
      overrides?.surveyRunService ??
      ({
        getSurveyRun: vi
          .fn()
          .mockResolvedValue(
            SurveyRun.reconstitute(
              'run-1',
              'team-1',
              'model-1',
              'Survey 1',
              'closed',
              [],
            ),
          ),
      } as Pick<SurveyRunService, 'getSurveyRun'>);

    const assessmentService =
      overrides?.assessmentService ??
      ({
        getCapabilityScore: vi.fn().mockResolvedValue({
          doraCapabilityId: 'capability-1',
          doraCapabilityName: 'Code maintainability',
          score: 4.5,
          responseCount: 2,
        }),
      } as Pick<AssessmentService, 'getCapabilityScore'>);

    const guidanceService =
      overrides?.guidanceService ??
      ({
        getGuidanceForCapability: vi.fn().mockResolvedValue({
          capabilityId: 'capability-1',
          capabilityName: 'Code maintainability',
          score: 4.5,
          level: 5,
          guidance: {
            level: 5,
            text: 'Pay down hotspots every sprint.',
          },
          doraReference: 'https://dora.dev/capabilities/code-maintainability/',
        } satisfies TailoredGuidance),
      } as Pick<GuidanceService, 'getGuidanceForCapability'>);

    return new GetSurveyRunCapabilityGuidanceUseCase(
      surveyRunService,
      assessmentService,
      guidanceService,
    );
  }

  test('returns tailored guidance for a capability in a closed survey run', async () => {
    const useCase = createUseCase();

    const result = await useCase.execute('run-1', 'capability-1');

    expect(result).toMatchObject({
      surveyRunId: 'run-1',
      teamId: 'team-1',
      surveyTitle: 'Survey 1',
      capabilityId: 'capability-1',
      capabilityName: 'Code maintainability',
      score: 4.5,
      level: 5,
      doraReference: 'https://dora.dev/capabilities/code-maintainability/',
    });
    expect(result.guidance?.text).toBe('Pay down hotspots every sprint.');
  });

  test('maps missing survey runs to unavailable guidance', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRun: vi
          .fn()
          .mockRejectedValue(new Error('Survey run not found')),
      },
    });

    await expect(
      useCase.execute('missing-run', 'capability-1'),
    ).rejects.toThrow(
      new SurveyRunGuidanceUnavailableError('Survey run not found'),
    );
  });

  test('throws when the survey run is not closed', async () => {
    const useCase = createUseCase({
      assessmentService: {
        getCapabilityScore: vi
          .fn()
          .mockRejectedValue(
            new SurveyRunNotClosedError(
              'Assessment results are only available for closed survey runs',
            ),
          ),
      },
    });

    await expect(useCase.execute('run-1', 'capability-1')).rejects.toThrow(
      new SurveyRunGuidanceUnavailableError(
        'Guidance is only available for closed survey runs',
      ),
    );
  });

  test('throws when the capability is not part of the survey run', async () => {
    const useCase = createUseCase({
      assessmentService: {
        getCapabilityScore: vi.fn().mockResolvedValue(null),
      },
    });

    await expect(
      useCase.execute('run-1', 'missing-capability'),
    ).rejects.toThrow(
      new SurveyRunGuidanceUnavailableError(
        'Capability is not part of this survey run',
      ),
    );
  });

  test('throws when the capability has no scored answers in that survey run', async () => {
    const useCase = createUseCase({
      assessmentService: {
        getCapabilityScore: vi.fn().mockResolvedValue({
          doraCapabilityId: 'capability-1',
          doraCapabilityName: 'Code maintainability',
          score: null,
          responseCount: 0,
        }),
      },
    });

    await expect(useCase.execute('run-1', 'capability-1')).rejects.toThrow(
      new SurveyRunGuidanceUnavailableError(
        'Capability score is not available for this survey run',
      ),
    );
  });

  test('throws when the capability record is not found in guidance data', async () => {
    const useCase = createUseCase({
      guidanceService: {
        getGuidanceForCapability: vi.fn().mockResolvedValue(null),
      },
    });

    await expect(useCase.execute('run-1', 'capability-1')).rejects.toThrow(
      new SurveyRunGuidanceUnavailableError('Capability not found'),
    );
  });

  test('preserves null guidance so the page can render a warning state', async () => {
    const useCase = createUseCase({
      guidanceService: {
        getGuidanceForCapability: vi.fn().mockResolvedValue({
          capabilityId: 'capability-1',
          capabilityName: 'Code maintainability',
          score: 4.5,
          level: 5,
          guidance: null,
          doraReference: 'https://dora.dev/capabilities/code-maintainability/',
        } satisfies TailoredGuidance),
      },
    });

    const result = await useCase.execute('run-1', 'capability-1');

    expect(result.guidance).toBeNull();
  });

  test('propagates authorization failures from survey run access', async () => {
    const useCase = createUseCase({
      surveyRunService: {
        getSurveyRun: vi
          .fn()
          .mockRejectedValue(
            new AuthorizationError('Access denied: not a team member'),
          ),
      },
    });

    await expect(useCase.execute('run-1', 'capability-1')).rejects.toThrow(
      new AuthorizationError('Access denied: not a team member'),
    );
  });
});
