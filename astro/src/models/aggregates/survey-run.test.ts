import { expect, suite, test } from 'vitest';
import { SurveyRun, SurveyRunResponse } from '@models/aggregates/survey-run.ts';

suite('SurveyRun', () => {
  suite('calcAverageScore()', () => {
    test('returns 0 when there are no responses', () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'run-id',
        'team-id',
        'model-id',
        'Test Survey',
        'open',
        [],
      );

      // Act
      const result = surveyRun.calcAverageScore();

      // Assert
      expect(result).toBe(0);
    });

    test('returns 0 when all answers have null values', () => {
      // Arrange
      const responses = [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: null, comment: null },
          { answerValue: null, comment: 'some comment' },
        ]),
      ];
      const surveyRun = SurveyRun.reconstitute(
        'run-id',
        'team-id',
        'model-id',
        'Test Survey',
        'open',
        responses,
      );

      // Act
      const result = surveyRun.calcAverageScore();

      // Assert
      expect(result).toBe(0);
    });

    test('returns correct average for a single response with one answer', () => {
      // Arrange
      const responses = [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: 5, comment: null },
        ]),
      ];
      const surveyRun = SurveyRun.reconstitute(
        'run-id',
        'team-id',
        'model-id',
        'Test Survey',
        'open',
        responses,
      );

      // Act
      const result = surveyRun.calcAverageScore();

      // Assert
      expect(result).toBe(5);
    });

    test('returns correct average for a single response with multiple answers', () => {
      // Arrange
      const responses = [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: 3, comment: null },
          { answerValue: 4, comment: null },
          { answerValue: 5, comment: null },
        ]),
      ];
      const surveyRun = SurveyRun.reconstitute(
        'run-id',
        'team-id',
        'model-id',
        'Test Survey',
        'open',
        responses,
      );

      // Act
      const result = surveyRun.calcAverageScore();

      // Assert
      expect(result).toBe(4);
    });

    test('returns correct average across multiple responses', () => {
      // Arrange
      const responses = [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: 3, comment: null },
          { answerValue: 4, comment: null },
        ]),
        SurveyRunResponse.reconstitute('resp-2', 'user-2', [
          { answerValue: 5, comment: null },
          { answerValue: 4, comment: null },
        ]),
      ];
      const surveyRun = SurveyRun.reconstitute(
        'run-id',
        'team-id',
        'model-id',
        'Test Survey',
        'open',
        responses,
      );

      // Act
      const result = surveyRun.calcAverageScore();

      // Assert
      expect(result).toBe(4);
    });

    test('skips null answer values when calculating the average', () => {
      // Arrange
      const responses = [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: 5, comment: null },
          { answerValue: null, comment: null },
          { answerValue: 5, comment: null },
        ]),
      ];
      const surveyRun = SurveyRun.reconstitute(
        'run-id',
        'team-id',
        'model-id',
        'Test Survey',
        'open',
        responses,
      );

      // Act
      const result = surveyRun.calcAverageScore();

      // Assert
      expect(result).toBe(5);
    });

    test('returns non-integer average when result is not whole', () => {
      // Arrange
      const responses = [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: 1, comment: null },
          { answerValue: 2, comment: null },
        ]),
      ];
      const surveyRun = SurveyRun.reconstitute(
        'run-id',
        'team-id',
        'model-id',
        'Test Survey',
        'open',
        responses,
      );

      // Act
      const result = surveyRun.calcAverageScore();

      // Assert
      expect(result).toBe(1.5);
    });

    test('handles mixed null and non-null answers across multiple responses', () => {
      // Arrange
      const responses = [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: 5, comment: null },
          { answerValue: null, comment: null },
        ]),
        SurveyRunResponse.reconstitute('resp-2', 'user-2', [
          { answerValue: null, comment: null },
          { answerValue: 5, comment: null },
        ]),
      ];
      const surveyRun = SurveyRun.reconstitute(
        'run-id',
        'team-id',
        'model-id',
        'Test Survey',
        'open',
        responses,
      );

      // Act
      const result = surveyRun.calcAverageScore();

      // Assert
      expect(result).toBe(5);
    });
  });
});
