import { expect, suite, test, vi } from 'vitest';
import {
  AssessmentService,
  SurveyRunNotClosedError,
} from '@services/assessment-service.ts';
import type { SurveyRunRepository } from '@database/survey-run-repository.ts';
import type { SurveyModelRepository } from '@database/survey-model-repository.ts';
import type { DoraCapabilityRepository } from '@database/dora-capability-repository.ts';
import { SurveyRun, SurveyRunResponse } from '@models/aggregates/survey-run.ts';
import {
  SurveyModel,
  SurveyQuestion,
} from '@models/aggregates/survey-model.ts';
import { DoraCapability } from '@models/aggregates/dora-capability.ts';

suite('AssessmentService', () => {
  const createMockDoraCapabilities = () => [
    new DoraCapability(
      'cap-1',
      'continuous-integration',
      'Continuous Integration',
      'CI description',
      'https://dora.dev',
      [],
    ),
    new DoraCapability(
      'cap-2',
      'deployment-automation',
      'Deployment Automation',
      'Deployment description',
      'https://dora.dev',
      [],
    ),
  ];

  const createMockSurveyModel = () =>
    SurveyModel.reconstitute('model-1', 'v1.0', [
      new SurveyQuestion('q1', 'cap-1', 'How well do you do CI?', 1),
      new SurveyQuestion('q2', 'cap-2', 'How automated is deployment?', 2),
    ]);

  suite('getAssessmentResults()', () => {
    test('returns null when survey run does not exist', async () => {
      // Arrange
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {} as any as SurveyModelRepository;
      const mockDoraCapabilityRepository =
        {} as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      // Act
      const result = await service.getAssessmentResults('nonexistent-id');

      // Assert
      expect(result).toBeNull();
    });

    test('throws SurveyRunNotClosedError when survey run is not closed', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'open',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {} as any as SurveyModelRepository;
      const mockDoraCapabilityRepository =
        {} as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      // Act & Assert
      await expect(service.getAssessmentResults('run-1')).rejects.toThrow(
        SurveyRunNotClosedError,
      );
    });

    test('calculates scores from a single response', async () => {
      // Arrange
      const response = SurveyRunResponse.reconstitute('resp-1', 'user-1', [
        { answerValue: 5, comment: null },
        { answerValue: 7, comment: null },
      ]);
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'closed',
        [response],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(createMockSurveyModel()),
      } as any as SurveyModelRepository;
      const mockDoraCapabilityRepository = {
        getAll: vi.fn().mockResolvedValue(createMockDoraCapabilities()),
      } as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      // Act
      const result = await service.getAssessmentResults('run-1');

      // Assert
      expect(result).not.toBeNull();
      expect(result!.surveyRunId).toBe('run-1');
      expect(result!.teamId).toBe('team-1');
      expect(result!.doraCapabilityScores).toHaveLength(2);
      expect(result!.doraCapabilityScores[0]).toEqual({
        doraCapabilityId: 'cap-1',
        doraCapabilityName: 'Continuous Integration',
        score: 5,
        responseCount: 1,
      });
      expect(result!.doraCapabilityScores[1]).toEqual({
        doraCapabilityId: 'cap-2',
        doraCapabilityName: 'Deployment Automation',
        score: 7,
        responseCount: 1,
      });
    });

    test('calculates aggregated scores from multiple responses', async () => {
      // Arrange
      const response1 = SurveyRunResponse.reconstitute('resp-1', 'user-1', [
        { answerValue: 5, comment: null },
        { answerValue: 6, comment: null },
      ]);
      const response2 = SurveyRunResponse.reconstitute('resp-2', 'user-2', [
        { answerValue: 6, comment: null },
        { answerValue: 7, comment: null },
      ]);
      const response3 = SurveyRunResponse.reconstitute('resp-3', 'user-3', [
        { answerValue: 7, comment: null },
        { answerValue: 5, comment: null },
      ]);
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'closed',
        [response1, response2, response3],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(createMockSurveyModel()),
      } as any as SurveyModelRepository;
      const mockDoraCapabilityRepository = {
        getAll: vi.fn().mockResolvedValue(createMockDoraCapabilities()),
      } as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      // Act
      const result = await service.getAssessmentResults('run-1');

      // Assert
      expect(result).not.toBeNull();
      // (5+6+7)/3 = 6.0
      expect(result!.doraCapabilityScores[0].score).toBe(6);
      expect(result!.doraCapabilityScores[0].responseCount).toBe(3);
      // (6+7+5)/3 = 6.0
      expect(result!.doraCapabilityScores[1].score).toBe(6);
      expect(result!.doraCapabilityScores[1].responseCount).toBe(3);
    });

    test('handles responses with null/missing values', async () => {
      // Arrange
      const response1 = SurveyRunResponse.reconstitute('resp-1', 'user-1', [
        { answerValue: 5, comment: null },
        { answerValue: null, comment: null },
      ]);
      const response2 = SurveyRunResponse.reconstitute('resp-2', 'user-2', [
        { answerValue: 7, comment: null },
        { answerValue: 6, comment: null },
      ]);
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'closed',
        [response1, response2],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(createMockSurveyModel()),
      } as any as SurveyModelRepository;
      const mockDoraCapabilityRepository = {
        getAll: vi.fn().mockResolvedValue(createMockDoraCapabilities()),
      } as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      // Act
      const result = await service.getAssessmentResults('run-1');

      // Assert
      expect(result).not.toBeNull();
      // (5+7)/2 = 6.0
      expect(result!.doraCapabilityScores[0].score).toBe(6);
      expect(result!.doraCapabilityScores[0].responseCount).toBe(2);
      // Only user-2 answered question 2: 6
      expect(result!.doraCapabilityScores[1].score).toBe(6);
      expect(result!.doraCapabilityScores[1].responseCount).toBe(1);
    });

    test('returns null scores when no responses exist', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'closed',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(createMockSurveyModel()),
      } as any as SurveyModelRepository;
      const mockDoraCapabilityRepository = {
        getAll: vi.fn().mockResolvedValue(createMockDoraCapabilities()),
      } as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      // Act
      const result = await service.getAssessmentResults('run-1');

      // Assert
      expect(result).not.toBeNull();
      expect(result!.doraCapabilityScores[0].score).toBeNull();
      expect(result!.doraCapabilityScores[0].responseCount).toBe(0);
      expect(result!.doraCapabilityScores[1].score).toBeNull();
      expect(result!.doraCapabilityScores[1].responseCount).toBe(0);
    });

    test('does not expose individual response data (privacy)', async () => {
      // Arrange
      const response1 = SurveyRunResponse.reconstitute('resp-1', 'user-1', [
        { answerValue: 5, comment: 'My comment' },
        { answerValue: 6, comment: null },
      ]);
      const response2 = SurveyRunResponse.reconstitute('resp-2', 'user-2', [
        { answerValue: 7, comment: null },
        { answerValue: 4, comment: null },
      ]);
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'closed',
        [response1, response2],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(createMockSurveyModel()),
      } as any as SurveyModelRepository;
      const mockDoraCapabilityRepository = {
        getAll: vi.fn().mockResolvedValue(createMockDoraCapabilities()),
      } as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      // Act
      const result = await service.getAssessmentResults('run-1');

      // Assert
      expect(result).not.toBeNull();
      const resultString = JSON.stringify(result);
      // Verify no respondent IDs are exposed
      expect(resultString).not.toContain('user-1');
      expect(resultString).not.toContain('user-2');
      expect(resultString).not.toContain('respondentId');
      // Verify no individual answers are exposed
      expect(resultString).not.toContain('answerValue');
      expect(resultString).not.toContain('My comment');
    });

    test('rounds scores to one decimal place', async () => {
      // Arrange
      const response1 = SurveyRunResponse.reconstitute('resp-1', 'user-1', [
        { answerValue: 5, comment: null },
        { answerValue: 5, comment: null },
      ]);
      const response2 = SurveyRunResponse.reconstitute('resp-2', 'user-2', [
        { answerValue: 6, comment: null },
        { answerValue: 6, comment: null },
      ]);
      const response3 = SurveyRunResponse.reconstitute('resp-3', 'user-3', [
        { answerValue: 6, comment: null },
        { answerValue: 6, comment: null },
      ]);
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'closed',
        [response1, response2, response3],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(createMockSurveyModel()),
      } as any as SurveyModelRepository;
      const mockDoraCapabilityRepository = {
        getAll: vi.fn().mockResolvedValue(createMockDoraCapabilities()),
      } as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      // Act
      const result = await service.getAssessmentResults('run-1');

      // Assert
      expect(result).not.toBeNull();
      // (5+6+6)/3 = 5.666... should round to 5.7
      expect(result!.doraCapabilityScores[0].score).toBe(5.7);
    });
  });

  suite('getCapabilityScore()', () => {
    test('returns the requested capability score for a closed survey run', async () => {
      const response = SurveyRunResponse.reconstitute('resp-1', 'user-1', [
        { answerValue: 5, comment: null },
        { answerValue: 7, comment: null },
      ]);
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'closed',
        [response],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(createMockSurveyModel()),
      } as any as SurveyModelRepository;
      const mockDoraCapabilityRepository = {
        getAll: vi.fn().mockResolvedValue(createMockDoraCapabilities()),
      } as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      const result = await service.getCapabilityScore('run-1', 'cap-2');

      expect(result).toEqual({
        doraCapabilityId: 'cap-2',
        doraCapabilityName: 'Deployment Automation',
        score: 7,
        responseCount: 1,
      });
    });

    test('returns null when the capability is not part of the survey run', async () => {
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'closed',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(createMockSurveyModel()),
      } as any as SurveyModelRepository;
      const mockDoraCapabilityRepository = {
        getAll: vi.fn().mockResolvedValue(createMockDoraCapabilities()),
      } as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      const result = await service.getCapabilityScore('run-1', 'missing-cap');

      expect(result).toBeNull();
    });

    test('preserves null score values when no answers exist for a capability', async () => {
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'closed',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(createMockSurveyModel()),
      } as any as SurveyModelRepository;
      const mockDoraCapabilityRepository = {
        getAll: vi.fn().mockResolvedValue(createMockDoraCapabilities()),
      } as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      const result = await service.getCapabilityScore('run-1', 'cap-1');

      expect(result).toEqual({
        doraCapabilityId: 'cap-1',
        doraCapabilityName: 'Continuous Integration',
        score: null,
        responseCount: 0,
      });
    });

    test('throws SurveyRunNotClosedError for open survey runs', async () => {
      const surveyRun = SurveyRun.reconstitute(
        'run-1',
        'team-1',
        'model-1',
        'Test Survey',
        'open',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockSurveyModelRepository = {} as any as SurveyModelRepository;
      const mockDoraCapabilityRepository =
        {} as any as DoraCapabilityRepository;
      const service = new AssessmentService(
        mockSurveyRunRepository,
        mockSurveyModelRepository,
        mockDoraCapabilityRepository,
      );

      await expect(
        service.getCapabilityScore('run-1', 'cap-1'),
      ).rejects.toThrow(SurveyRunNotClosedError);
    });
  });
});
