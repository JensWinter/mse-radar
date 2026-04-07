import {
  SurveyModel,
  SurveyQuestion,
} from '@models/aggregates/survey-model.ts';
import { query } from '@database/db.ts';

export interface SurveyModelRepository {
  getAll(): Promise<SurveyModel[]>;
  getById(id: string): Promise<SurveyModel | null>;
  getByVersion(version: string): Promise<SurveyModel | null>;
}

type SurveyModelRow = {
  id: string;
  version: string;
};

type SurveyQuestionRow = {
  id: string;
  dora_capability_id: string;
  question_text: string;
  sort_order: number;
};

export class SqliteSurveyModelRepository implements SurveyModelRepository {
  async getAll(): Promise<SurveyModel[]> {
    const surveyModelRows = query<SurveyModelRow>(
      'SELECT id, version FROM survey_models',
    );
    return surveyModelRows.rows.map((row) =>
      SurveyModel.reconstitute(row.id, row.version, []),
    );
  }

  async getById(id: string): Promise<SurveyModel | null> {
    const surveyModelRows = query<SurveyModelRow>(
      'SELECT id, version FROM survey_models WHERE id = ?',
      [id],
    );

    const surveyModelRow = surveyModelRows.rows[0];
    if (!surveyModelRow) {
      return null;
    }

    const questionRows = query<SurveyQuestionRow>(
      `SELECT id, dora_capability_id, question_text, sort_order
       FROM questions
       WHERE survey_model_id = ?
       ORDER BY sort_order`,
      [id],
    );

    const questions = questionRows.rows.map(
      (row) =>
        new SurveyQuestion(
          row.id,
          row.dora_capability_id,
          row.question_text,
          row.sort_order,
        ),
    );

    return SurveyModel.reconstitute(
      surveyModelRow.id,
      surveyModelRow.version,
      questions,
    );
  }

  async getByVersion(version: string): Promise<SurveyModel | null> {
    const surveyModelRows = query<SurveyModelRow>(
      'SELECT id, version FROM survey_models WHERE version = ?',
      [version],
    );

    const surveyModelRow = surveyModelRows.rows[0];
    if (!surveyModelRow) {
      return null;
    }

    const questionRows = query<SurveyQuestionRow>(
      `SELECT id, dora_capability_id, question_text, sort_order
       FROM questions
       WHERE survey_model_id = ?
       ORDER BY sort_order`,
      [surveyModelRow.id],
    );

    const questions = questionRows.rows.map(
      (row) =>
        new SurveyQuestion(
          row.id,
          row.dora_capability_id,
          row.question_text,
          row.sort_order,
        ),
    );

    return SurveyModel.reconstitute(
      surveyModelRow.id,
      surveyModelRow.version,
      questions,
    );
  }
}
