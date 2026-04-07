import {
  type AnswerValue,
  SurveyRun,
  SurveyRunResponse,
} from '@models/aggregates/survey-run.ts';
import { query, execute, transaction } from '@database/db.ts';

export interface SurveyRunRepository {
  getAllByTeamId(teamId: string): Promise<SurveyRun[]>;
  getById(id: string): Promise<SurveyRun | null>;
  save(surveyRun: SurveyRun): Promise<void>;
}

type SurveyRunRow = {
  id: string;
  team_id: string;
  survey_model_id: string;
  title: string;
  status: string;
};

type SurveyResponseRow = {
  id: string;
  respondent_id: string;
  answer_values: string;
  answer_comments: string;
};

export class SqliteSurveyRunRepository implements SurveyRunRepository {
  async getAllByTeamId(teamId: string): Promise<SurveyRun[]> {
    const { rows: surveyRunRows } = query<SurveyRunRow>(
      `
SELECT id, team_id, survey_model_id, title, status
FROM survey_runs
WHERE team_id = ?`,
      [teamId],
    );
    return surveyRunRows.map((row) =>
      SurveyRun.reconstitute(
        row.id,
        row.team_id,
        row.survey_model_id,
        row.title,
        row.status,
        [],
      ),
    );
  }

  async getById(id: string): Promise<SurveyRun | null> {
    const { rows: surveyRunRows } = query<SurveyRunRow>(
      'SELECT id, team_id, survey_model_id, title, status FROM survey_runs WHERE id = ?',
      [id],
    );

    const surveyRunRow = surveyRunRows[0];

    if (!surveyRunRow) {
      return null;
    }

    const responseRows = query<SurveyResponseRow>(
      `
SELECT id, respondent_id, answer_values, answer_comments
FROM survey_responses
WHERE survey_run_id = ?`,
      [surveyRunRow.id],
    );

    const surveyResponses = responseRows.rows.map((row) => {
      const answerValues: (AnswerValue | null)[] = JSON.parse(
        row.answer_values || '[]',
      );
      const answerComments: (string | null)[] = JSON.parse(
        row.answer_comments || '[]',
      );

      const answers = answerValues.map((answerValue, index) => ({
        answerValue,
        comment: answerComments[index] ?? null,
      }));
      return SurveyRunResponse.reconstitute(row.id, row.respondent_id, answers);
    });

    return SurveyRun.reconstitute(
      surveyRunRow.id,
      surveyRunRow.team_id,
      surveyRunRow.survey_model_id,
      surveyRunRow.title,
      surveyRunRow.status,
      surveyResponses,
    );
  }

  async save(surveyRun: SurveyRun): Promise<void> {
    transaction(() => {
      execute(
        `INSERT INTO survey_runs (id, team_id, survey_model_id, title, status)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET team_id = excluded.team_id, survey_model_id = excluded.survey_model_id, title = excluded.title, status = excluded.status`,
        [
          surveyRun.id,
          surveyRun.teamId,
          surveyRun.surveyModelId,
          surveyRun.title,
          surveyRun.status,
        ],
      );

      for (const response of surveyRun.responses) {
        const answerValues = response.answers.map(
          (answer) => answer.answerValue,
        );
        const comments = response.answers.map((answer) => answer.comment);

        execute(
          `INSERT INTO survey_responses (id, survey_run_id, respondent_id, answer_values, answer_comments)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT(survey_run_id, respondent_id) DO UPDATE SET
  answer_values = excluded.answer_values,
  answer_comments = excluded.answer_comments`,
          [
            response.id,
            surveyRun.id,
            response.respondentId,
            JSON.stringify(answerValues),
            JSON.stringify(comments),
          ],
        );
      }

      const respondentIds = surveyRun.responses.map((r) => r.respondentId);
      if (respondentIds.length > 0) {
        const placeholders = respondentIds.map(() => '?').join(', ');
        execute(
          `DELETE FROM survey_responses WHERE survey_run_id = ? AND respondent_id NOT IN (${placeholders})`,
          [surveyRun.id, ...respondentIds],
        );
      } else {
        execute('DELETE FROM survey_responses WHERE survey_run_id = ?', [
          surveyRun.id,
        ]);
      }
    });
  }
}
