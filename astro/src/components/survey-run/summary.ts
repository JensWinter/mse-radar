import type { AnswerValue, SurveyRun } from '@models/aggregates/survey-run.ts';

export type SurveyRunSummaryData = {
  scoreCounts: [number, number, number, number, number, number, number];
  totalScoredAnswers: number;
  maxCount: number;
};

export function buildSurveyRunSummary(
  surveyRun: SurveyRun,
): SurveyRunSummaryData {
  const scoreCounts: SurveyRunSummaryData['scoreCounts'] = [
    0, 0, 0, 0, 0, 0, 0,
  ];

  const scoredAnswers = surveyRun.responses
    .flatMap((response) => response.answers)
    .filter((answer) => answer.answerValue !== null)
    .map((answer) => answer.answerValue as AnswerValue);

  for (const score of scoredAnswers) {
    scoreCounts[score - 1] += 1;
  }

  return {
    scoreCounts,
    totalScoredAnswers: scoredAnswers.length,
    maxCount: Math.max(...scoreCounts),
  };
}
