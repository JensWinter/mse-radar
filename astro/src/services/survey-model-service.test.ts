import { expect, suite, test, vi } from 'vitest';
import { SurveyModelService } from '@services/survey-model-service.ts';
import type { SurveyModelRepository } from '@database/survey-model-repository.ts';
import {
  SurveyModel,
  SurveyQuestion,
} from '@models/aggregates/survey-model.ts';

suite('SurveyModelService', () => {
  suite('getAllSurveyModels()', () => {
    test('returns array of survey models when models exist', async () => {
      // Arrange
      const question1 = new SurveyQuestion(
        'question-id-1',
        'dora-capability-1',
        'How do you rate X?',
        1,
      );
      const question2 = new SurveyQuestion(
        'question-id-2',
        'dora-capability-2',
        'How do you rate Y?',
        2,
      );
      const surveyModel1 = SurveyModel.reconstitute('model-id-1', '1.0', [
        question1,
      ]);
      const surveyModel2 = SurveyModel.reconstitute('model-id-2', '2.0', [
        question2,
      ]);
      const mockSurveyModelRepository = {
        getAll: vi.fn().mockResolvedValue([surveyModel1, surveyModel2]),
      } as any as SurveyModelRepository;
      const surveyModelService = new SurveyModelService(
        mockSurveyModelRepository,
      );

      // Act
      const result = await surveyModelService.getAllSurveyModels();

      // Assert
      expect(mockSurveyModelRepository.getAll).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'model-id-1',
          version: '1.0',
          questions: [
            {
              id: 'question-id-1',
              doraCapabilityId: 'dora-capability-1',
              questionText: 'How do you rate X?',
              sortOrder: 1,
            },
          ],
        },
        {
          id: 'model-id-2',
          version: '2.0',
          questions: [
            {
              id: 'question-id-2',
              doraCapabilityId: 'dora-capability-2',
              questionText: 'How do you rate Y?',
              sortOrder: 2,
            },
          ],
        },
      ]);
    });

    test('returns empty array when no models exist', async () => {
      // Arrange
      const mockSurveyModelRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      } as any as SurveyModelRepository;
      const surveyModelService = new SurveyModelService(
        mockSurveyModelRepository,
      );

      // Act
      const result = await surveyModelService.getAllSurveyModels();

      // Assert
      expect(mockSurveyModelRepository.getAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    test('returns survey model with multiple questions', async () => {
      // Arrange
      const question1 = new SurveyQuestion(
        'question-id-1',
        'dora-capability-1',
        'Question 1?',
        1,
      );
      const question2 = new SurveyQuestion(
        'question-id-2',
        'dora-capability-2',
        'Question 2?',
        2,
      );
      const question3 = new SurveyQuestion(
        'question-id-3',
        'dora-capability-3',
        'Question 3?',
        3,
      );
      const surveyModel = SurveyModel.reconstitute('model-id', '1.0', [
        question1,
        question2,
        question3,
      ]);
      const mockSurveyModelRepository = {
        getAll: vi.fn().mockResolvedValue([surveyModel]),
      } as any as SurveyModelRepository;
      const surveyModelService = new SurveyModelService(
        mockSurveyModelRepository,
      );

      // Act
      const result = await surveyModelService.getAllSurveyModels();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].questions).toHaveLength(3);
      expect(result[0].questions).toEqual([
        {
          id: 'question-id-1',
          doraCapabilityId: 'dora-capability-1',
          questionText: 'Question 1?',
          sortOrder: 1,
        },
        {
          id: 'question-id-2',
          doraCapabilityId: 'dora-capability-2',
          questionText: 'Question 2?',
          sortOrder: 2,
        },
        {
          id: 'question-id-3',
          doraCapabilityId: 'dora-capability-3',
          questionText: 'Question 3?',
          sortOrder: 3,
        },
      ]);
    });
  });

  suite('getSurveyModel()', () => {
    test('returns survey model when model exists', async () => {
      // Arrange
      const question = new SurveyQuestion(
        'question-id',
        'dora-capability-id',
        'How do you rate this?',
        1,
      );
      const surveyModel = SurveyModel.reconstitute('model-id', '1.0', [
        question,
      ]);
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(surveyModel),
      } as any as SurveyModelRepository;
      const surveyModelService = new SurveyModelService(
        mockSurveyModelRepository,
      );

      // Act
      const result = await surveyModelService.getSurveyModel('model-id');

      // Assert
      expect(mockSurveyModelRepository.getById).toHaveBeenCalledWith(
        'model-id',
      );
      expect(result).toEqual({
        id: 'model-id',
        version: '1.0',
        questions: [
          {
            id: 'question-id',
            doraCapabilityId: 'dora-capability-id',
            questionText: 'How do you rate this?',
            sortOrder: 1,
          },
        ],
      });
    });

    test('returns null when model does not exist', async () => {
      // Arrange
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as SurveyModelRepository;
      const surveyModelService = new SurveyModelService(
        mockSurveyModelRepository,
      );

      // Act
      const result = await surveyModelService.getSurveyModel('nonexistent-id');

      // Assert
      expect(mockSurveyModelRepository.getById).toHaveBeenCalledWith(
        'nonexistent-id',
      );
      expect(result).toBeNull();
    });

    test('returns survey model with empty questions array', async () => {
      // Arrange
      const surveyModel = SurveyModel.reconstitute('model-id', '1.0', []);
      const mockSurveyModelRepository = {
        getById: vi.fn().mockResolvedValue(surveyModel),
      } as any as SurveyModelRepository;
      const surveyModelService = new SurveyModelService(
        mockSurveyModelRepository,
      );

      // Act
      const result = await surveyModelService.getSurveyModel('model-id');

      // Assert
      expect(result).toEqual({
        id: 'model-id',
        version: '1.0',
        questions: [],
      });
    });
  });

  suite('getSurveyModelByVersion()', () => {
    test('returns survey model when model exists', async () => {
      // Arrange
      const question = new SurveyQuestion(
        'question-id',
        'dora-capability-id',
        'How do you rate this?',
        1,
      );
      const surveyModel = SurveyModel.reconstitute('model-id', '1.0', [
        question,
      ]);
      const mockSurveyModelRepository = {
        getByVersion: vi.fn().mockResolvedValue(surveyModel),
      } as any as SurveyModelRepository;
      const surveyModelService = new SurveyModelService(
        mockSurveyModelRepository,
      );

      // Act
      const result = await surveyModelService.getSurveyModelByVersion('1.0');

      // Assert
      expect(mockSurveyModelRepository.getByVersion).toHaveBeenCalledWith(
        '1.0',
      );
      expect(result).toEqual({
        id: 'model-id',
        version: '1.0',
        questions: [
          {
            id: 'question-id',
            doraCapabilityId: 'dora-capability-id',
            questionText: 'How do you rate this?',
            sortOrder: 1,
          },
        ],
      });
    });

    test('returns null when model does not exist', async () => {
      // Arrange
      const mockSurveyModelRepository = {
        getByVersion: vi.fn().mockResolvedValue(null),
      } as any as SurveyModelRepository;
      const surveyModelService = new SurveyModelService(
        mockSurveyModelRepository,
      );

      // Act
      const result =
        await surveyModelService.getSurveyModelByVersion('nonexistent');

      // Assert
      expect(mockSurveyModelRepository.getByVersion).toHaveBeenCalledWith(
        'nonexistent',
      );
      expect(result).toBeNull();
    });

    test('returns survey model with empty questions array', async () => {
      // Arrange
      const surveyModel = SurveyModel.reconstitute('model-id', '1.0', []);
      const mockSurveyModelRepository = {
        getByVersion: vi.fn().mockResolvedValue(surveyModel),
      } as any as SurveyModelRepository;
      const surveyModelService = new SurveyModelService(
        mockSurveyModelRepository,
      );

      // Act
      const result = await surveyModelService.getSurveyModelByVersion('1.0');

      // Assert
      expect(result).toEqual({
        id: 'model-id',
        version: '1.0',
        questions: [],
      });
    });
  });
});
