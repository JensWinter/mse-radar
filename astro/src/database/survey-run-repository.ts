import {
  type AnswerValue,
  SurveyRun,
  SurveyRunResponse,
  type SurveyRunStatus,
} from '@models/aggregates/survey-run.ts';
import { query, transaction } from '@database/db.ts';
import { getResponseCrypto } from '@lib/response-crypto.ts';

export type GetAllByTeamIdOptions = {
  includeResponses?: boolean;
  status?: SurveyRunStatus;
};

export interface SurveyRunRepository {
  getAllByTeamId(
    teamId: string,
    options?: GetAllByTeamIdOptions,
  ): Promise<SurveyRun[]>;
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

type SurveyRunWithResponseRow = {
  run_id: string;
  team_id: string;
  survey_model_id: string;
  title: string;
  status: string;
  response_id: string | null;
  respondent_id: string | null;
  answer_values: Buffer | null;
  answer_comments: Buffer | null;
};

export class PgSurveyRunRepository implements SurveyRunRepository {
  async getAllByTeamId(
    teamId: string,
    options: GetAllByTeamIdOptions = {},
  ): Promise<SurveyRun[]> {
    const { includeResponses = false, status } = options;

    if (includeResponses) {
      return this.fetchSurveyRunsWithResponses(teamId, status);
    }

    return this.fetchSurveyRunsWithoutResponses(teamId, status);
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

  private async fetchSurveyRunsWithResponses(
    teamId: string,
    status?: SurveyRunStatus,
  ): Promise<SurveyRun[]> {
    const params: unknown[] = [teamId];
    let statusClause = '';
    if (status) {
      params.push(status);
      statusClause = ` AND sr.status = $${params.length}`;
    }

    const { rows } = await query<SurveyRunWithResponseRow>(
      `
SELECT
  sr.id AS run_id,
  sr.team_id,
  sr.survey_model_id,
  sr.title,
  sr.status,
  resp.id AS response_id,
  resp.respondent_id,
  resp.answer_values,
  resp.answer_comments
FROM survey_runs sr
LEFT JOIN survey_responses resp ON resp.survey_run_id = sr.id
WHERE sr.team_id = $1${statusClause}
ORDER BY sr.created_at DESC, sr.id DESC, resp.id`,
      params,
    );

    const crypto = getResponseCrypto();
    const runs = new Map<
      string,
      { header: SurveyRunRow; responses: SurveyRunResponse[] }
    >();
    const order: string[] = [];

    for (const row of rows) {
      let entry = runs.get(row.run_id);
      if (!entry) {
        entry = {
          header: {
            id: row.run_id,
            team_id: row.team_id,
            survey_model_id: row.survey_model_id,
            title: row.title,
            status: row.status,
          },
          responses: [],
        };
        runs.set(row.run_id, entry);
        order.push(row.run_id);
      }

      if (
        row.response_id &&
        row.respondent_id &&
        row.answer_values &&
        row.answer_comments
      ) {
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
        entry.responses.push(
          SurveyRunResponse.reconstitute(
            row.response_id,
            row.respondent_id,
            answers,
          ),
        );
      }
    }

    return order.map((runId) => {
      const entry = runs.get(runId)!;
      return SurveyRun.reconstitute(
        entry.header.id,
        entry.header.team_id,
        entry.header.survey_model_id,
        entry.header.title,
        entry.header.status,
        entry.responses,
      );
    });
  }

  private async fetchSurveyRunsWithoutResponses(
    teamId: string,
    status?: SurveyRunStatus,
  ): Promise<SurveyRun[]> {
    const params: unknown[] = [teamId];
    let statusClause = '';
    if (status) {
      params.push(status);
      statusClause = ` AND status = $${params.length}`;
    }
    const { rows: surveyRunRows } = await query<SurveyRunRow>(
      `
SELECT id, team_id, survey_model_id, title, status
FROM survey_runs
WHERE team_id = $1${statusClause}
ORDER BY created_at DESC, id DESC`,
      params,
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
}
