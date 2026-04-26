import type { AnswerValue } from '@models/aggregates/survey-run.ts';

export type QuestionAnswer = {
  questionId: string;
  questionText: string;
  capabilityName: string;
  capabilityDescription: string;
  doraReference: string;
  answerValue: AnswerValue | null;
  comment: string | null;
};
