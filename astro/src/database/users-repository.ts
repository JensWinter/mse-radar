import { User } from '@models/aggregates/user.ts';
import { query } from '@database/db.ts';

export interface UsersRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

type UserRow = {
  id: string;
  email: string;
};

export class PgUsersRepository implements UsersRepository {
  async save(user: User): Promise<void> {
    await query('INSERT INTO users (id, email) VALUES ($1, $2)', [
      user.id,
      user.email,
    ]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query<UserRow>(
      'SELECT id, email FROM users WHERE email = $1',
      [email],
    );
    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return User.reconstitute(row.id, row.email);
  }
}
