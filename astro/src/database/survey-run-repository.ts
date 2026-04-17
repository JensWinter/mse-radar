import {
  type AnswerValue,
  SurveyRun,
  SurveyRunResponse,
} from '@models/aggregates/survey-run.ts';
import { query, transaction } from '@database/db.ts';
import { getResponseCrypto } from '@lib/response-crypto.ts';

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
  answer_values: Buffer;
  answer_comments: Buffer;
};

export class PgSurveyRunRepository implements SurveyRunRepository {
  async getAllByTeamId(teamId: string): Promise<SurveyRun[]> {
    const { rows: surveyRunRows } = await query<SurveyRunRow>(
      `
SELECT id, team_id, survey_model_id, title, status
FROM survey_runs
WHERE team_id = $1
ORDER BY created_at DESC, id DESC`,
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
    const { rows: surveyRunRows } = await query<SurveyRunRow>(
      'SELECT id, team_id, survey_model_id, title, status FROM survey_runs WHERE id = $1',
      [id],
    );

    const surveyRunRow = surveyRunRows[0];

    if (!surveyRunRow) {
      return null;
    }

    const responseRows = await query<SurveyResponseRow>(
      `
SELECT id, respondent_id, answer_values, answer_comments
FROM survey_responses
WHERE survey_run_id = $1`,
      [surveyRunRow.id],
    );

    const crypto = getResponseCrypto();
    const surveyResponses = responseRows.rows.map((row) => {
      const answerValues = crypto.decryptJson<(AnswerValue | null)[]>(
        row.answer_values,
      );
      const answerComments = crypto.decryptJson<(string | null)[]>(
        row.answer_comments,
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
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO survey_runs (id, team_id, survey_model_id, title, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET team_id = excluded.team_id, survey_model_id = excluded.survey_model_id, title = excluded.title, status = excluded.status`,
        [
          surveyRun.id,
          surveyRun.teamId,
          surveyRun.surveyModelId,
          surveyRun.title,
          surveyRun.status,
        ],
      );

      const crypto = getResponseCrypto();
      for (const response of surveyRun.responses) {
        const answerValues = response.answers.map(
          (answer) => answer.answerValue,
        );
        const comments = response.answers.map((answer) => answer.comment);

        await client.query(
          `INSERT INTO survey_responses (id, survey_run_id, respondent_id, answer_values, answer_comments)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT(survey_run_id, respondent_id) DO UPDATE SET
  answer_values = excluded.answer_values,
  answer_comments = excluded.answer_comments`,
          [
            response.id,
            surveyRun.id,
            response.respondentId,
            crypto.encryptJson(answerValues),
            crypto.encryptJson(comments),
          ],
        );
      }

      const respondentIds = surveyRun.responses.map((r) => r.respondentId);
      if (respondentIds.length > 0) {
        const placeholders = respondentIds
          .map((_, i) => `$${i + 2}`)
          .join(', ');
        await client.query(
          `DELETE FROM survey_responses WHERE survey_run_id = $1 AND respondent_id NOT IN (${placeholders})`,
          [surveyRun.id, ...respondentIds],
        );
      } else {
        await client.query(
          'DELETE FROM survey_responses WHERE survey_run_id = $1',
          [surveyRun.id],
        );
      }
    });
  }
}
