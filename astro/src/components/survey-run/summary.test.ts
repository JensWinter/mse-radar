import { expect, suite, test } from 'vitest';
import { SurveyRun, SurveyRunResponse } from '@models/aggregates/survey-run.ts';
import { buildSurveyRunSummary } from './summary.ts';

suite('buildSurveyRunSummary()', () => {
  test('counts scores across multiple responses', () => {
    const surveyRun = SurveyRun.reconstitute(
      'run-id',
      'team-id',
      'model-id',
      'Test Survey',
      'closed',
      [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: 1, comment: null },
          { answerValue: 4, comment: null },
          { answerValue: 5, comment: null },
        ]),
        SurveyRunResponse.reconstitute('resp-2', 'user-2', [
          { answerValue: 4, comment: null },
          { answerValue: 4, comment: null },
          { answerValue: 2, comment: null },
        ]),
      ],
    );

    const result = buildSurveyRunSummary(surveyRun);

    expect(result).toEqual({
      scoreCounts: [1, 1, 0, 3, 1],
      totalScoredAnswers: 6,
      maxCount: 3,
    });
  });

  test('ignores null answers', () => {
    const surveyRun = SurveyRun.reconstitute(
      'run-id',
      'team-id',
      'model-id',
      'Test Survey',
      'closed',
      [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: null, comment: null },
          { answerValue: 2, comment: null },
          { answerValue: null, comment: null },
        ]),
        SurveyRunResponse.reconstitute('resp-2', 'user-2', [
          { answerValue: 5, comment: null },
          { answerValue: null, comment: null },
        ]),
      ],
    );

    const result = buildSurveyRunSummary(surveyRun);

    expect(result).toEqual({
      scoreCounts: [0, 1, 0, 0, 1],
      totalScoredAnswers: 2,
      maxCount: 1,
    });
  });

  test('returns an empty distribution when there are no scored answers', () => {
    const surveyRun = SurveyRun.reconstitute(
      'run-id',
      'team-id',
      'model-id',
      'Test Survey',
      'closed',
      [
        SurveyRunResponse.reconstitute('resp-1', 'user-1', [
          { answerValue: null, comment: null },
        ]),
      ],
    );

    const result = buildSurveyRunSummary(surveyRun);

    expect(result).toEqual({
      scoreCounts: [0, 0, 0, 0, 0],
      totalScoredAnswers: 0,
      maxCount: 0,
    });
  });
});
