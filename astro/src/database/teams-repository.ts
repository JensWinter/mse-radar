import { Team, TeamMember } from '@models/aggregates/team.ts';
import { execute, query, transaction } from '@database/db.ts';

export interface TeamsRepository {
  getAll(): Promise<Team[]>;
  getAllByMembership(userId: string): Promise<Team[]>;
  getById(id: string): Promise<Team | null>;
  save(team: Team): Promise<void>;
  existsByName(name: string): Promise<boolean>;
  deleteById(id: string): Promise<void>;
}

type TeamRow = {
  id: string;
  name: string;
  description: string;
};
type TeamMemberRow = {
  id: string;
  user_id: string;
  user_email: string;
  role: string;
};

export class PgTeamsRepository implements TeamsRepository {
  async getAll(): Promise<Team[]> {
    const { rows: teamRows } = await query<TeamRow>(
      'SELECT id, name, description FROM teams',
    );
    return teamRows.map((row) =>
      Team.reconstitute(row.id, row.name, row.description, []),
    );
  }

  async getAllByMembership(userId: string): Promise<Team[]> {
    const { rows: teamRows } = await query<TeamRow>(
      `
SELECT id, name, description
FROM teams
WHERE id IN (
  SELECT team_id
  FROM team_memberships
  WHERE user_id = $1
)`,
      [userId],
    );
    return teamRows.map((row) =>
      Team.reconstitute(row.id, row.name, row.description, []),
    );
  }

  async getById(id: string): Promise<Team | null> {
    const { rows: teamRows } = await query<TeamRow>(
      'SELECT id, name, description FROM teams WHERE id = $1',
      [id],
    );

    const teamRow = teamRows[0];

    if (!teamRow) {
      return null;
    }

    const memberRows = await query<TeamMemberRow>(
      `
SELECT tm.id, tm.user_id, u.email AS user_email, tm.role
FROM team_memberships AS tm
LEFT JOIN users AS u ON tm.user_id = u.id
WHERE tm.team_id = $1`,
      [id],
    );

    const members = memberRows.rows.map(
      (row) =>
        new TeamMember(
          row.id,
          id,
          row.user_id,
          row.user_email,
          row.role === 'team-lead' ? 'team-lead' : 'regular-member',
        ),
    );

    return Team.reconstitute(
      teamRow.id,
      teamRow.name,
      teamRow.description,
      members,
    );
  }

  async save(team: Team): Promise<void> {
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO teams (id, name, description) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET name = excluded.name, description = excluded.description`,
        [team.id, team.name, team.description],
      );

      await client.query('DELETE FROM team_memberships WHERE team_id = $1', [
        team.id,
      ]);

      for (const member of team.members) {
        await client.query(
          'INSERT INTO team_memberships (id, team_id, user_id, role) VALUES ($1, $2, $3, $4)',
          [member.id, team.id, member.userId, member.role],
        );
      }
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const result = await query<{ cnt: string }>(
      'SELECT COUNT(*) as cnt FROM teams WHERE name = $1',
      [name],
    );
    return Number(result.rows[0]?.cnt ?? 0) > 0;
  }

  async deleteById(id: string): Promise<void> {
    await execute('DELETE FROM teams WHERE id = $1', [id]);
  }
}
