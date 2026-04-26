import type { User } from '@models/aggregates/user.ts';

export class InvalidSurveyRunTitleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSurveyRunTitleError';
  }
}

export class SurveyRun {
  private _status: SurveyRunStatus;
  private _responses: SurveyRunResponse[] = [];
  private _title: string;

  constructor(
    public readonly id: string,
    public readonly teamId: string,
    public readonly surveyModelId: string,
    title: string,
    status: SurveyRunStatus = 'pending',
  ) {
    this.validateTitle(title);
    this._title = title;
    this._status = status;
  }

  get status(): SurveyRunStatus {
    return this._status;
  }

  set title(value: string) {
    this.validateTitle(value);
    this._title = value;
  }

  get title(): string {
    return this._title;
  }

  get responses() {
    return [...this._responses];
  }

  open() {
    if (this._status !== 'pending') {
      throw new Error('Survey run is not in pending status');
    }
    this._status = 'open';
  }

  close() {
    if (this._status !== 'open') {
      throw new Error('Survey run is not in open status');
    }
    this._status = 'closed';
  }

  reopen() {
    if (this._status !== 'closed') {
      throw new Error('Survey run is not in closed status');
    }
    this._status = 'open';
  }

  initializeResponse(user: User) {
    let response = this._responses.find((r) => r.respondentId === user.id);
    if (!response) {
      response = new SurveyRunResponse(crypto.randomUUID(), user.id);
      this._responses.push(response);
    }

    return response;
  }

  calcAverageScore() {
    const allAnswers = this._responses
      .flatMap((r) => r.answers)
      .filter((a) => a.answerValue !== null)
      .map((a) => a.answerValue as AnswerValue);

    const totalAnswers = allAnswers.length;

    if (totalAnswers === 0) {
      return 0;
    }

    return allAnswers.reduce((sum, answer) => sum + answer, 0) / totalAnswers;
  }

  static reconstitute(
    id: string,
    teamId: string,
    surveyModelId: string,
    title: string,
    status: string,
    responses: SurveyRunResponse[],
  ): SurveyRun {
    let statusEnum: SurveyRunStatus;
    switch (status) {
      case 'pending':
        statusEnum = 'pending';
        break;
      case 'open':
        statusEnum = 'open';
        break;
      case 'closed':
        statusEnum = 'closed';
        break;
      default:
        throw new Error('Invalid status');
    }
    const surveyRun = new SurveyRun(
      id,
      teamId,
      surveyModelId,
      title,
      statusEnum,
    );
    surveyRun._responses = responses;
    return surveyRun;
  }

  private validateTitle(title: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new InvalidSurveyRunTitleError('Survey run title cannot be empty');
    }
    if (trimmedTitle.length > 200) {
      throw new InvalidSurveyRunTitleError(
        'Survey run title cannot exceed 200 characters',
      );
    }
  }
}

export class SurveyRunResponse {
  private _answers: SurveyAnswer[] = [];

  constructor(
    public readonly id: string,
    public readonly respondentId: string,
  ) {}

  get answers(): ReadonlyArray<SurveyAnswer> {
    return [...this._answers];
  }

  updateAnswerValue(questionIndex: number, answerValue: AnswerValue | null) {
    this.padAnswers(questionIndex + 1);
    this._answers[questionIndex] = {
      ...this._answers[questionIndex],
      answerValue,
    };
  }

  updateComment(questionIndex: number, comment: string) {
    this.padAnswers(questionIndex + 1);
    this._answers[questionIndex] = {
      ...this._answers[questionIndex],
      comment: comment || null,
    };
  }

  private padAnswers(totalQuestions: number) {
    while (this._answers.length < totalQuestions) {
      this._answers.push({ answerValue: null, comment: null });
    }
  }

  static reconstitute(
    id: string,
    respondentId: string,
    answers: SurveyAnswer[],
  ): SurveyRunResponse {
    const response = new SurveyRunResponse(id, respondentId);
    response._answers = answers;
    return response;
  }
}

export type SurveyAnswer = {
  answerValue: AnswerValue | null;
  comment: string | null;
};

export type AnswerValue = 1 | 2 | 3 | 4 | 5;
export type SurveyRunStatus = 'pending' | 'open' | 'closed';
