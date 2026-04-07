export class SurveyModel {
  private readonly _version: string;
  private _questions: SurveyQuestion[] = [];

  constructor(
    public readonly id: string,
    version: string,
  ) {
    this.validateVersion(version);
    this._version = version;
  }

  get version(): string {
    return this._version;
  }

  get questions(): SurveyQuestion[] {
    return [...this._questions];
  }

  static reconstitute(
    id: string,
    version: string,
    questions: SurveyQuestion[],
  ) {
    const surveyModel = new SurveyModel(id, version);
    surveyModel._questions = questions;
    return surveyModel;
  }

  private validateVersion(version: string) {
    if (version.trim() === '') {
      throw new Error('Survey version cannot be empty');
    }
  }
}

export class SurveyQuestion {
  constructor(
    public readonly id: string,
    public readonly doraCapabilityId: string,
    public readonly questionText: string,
    public readonly sortOrder: number = 0,
  ) {}
}
