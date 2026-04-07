import type { AnswerValue } from '@models/aggregates/survey-run.ts';

export type QuestionAnswer = {
  questionId: string;
  questionText: string;
  capabilityName: string;
  answerValue: AnswerValue | null;
  comment: string | null;
};
