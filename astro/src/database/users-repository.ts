import { User } from '@models/aggregates/user.ts';
import { query, execute } from '@database/db.ts';

export interface UsersRepository {
  save(user: User): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

type UserRow = {
  id: string;
  email: string;
};

export class SqliteUsersRepository implements UsersRepository {
  async save(user: User): Promise<void> {
    execute('INSERT INTO users (id, email) VALUES (?, ?)', [
      user.id,
      user.email,
    ]);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = query<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM users WHERE email = ?',
      [email],
    );
    return (result.rows[0]?.cnt ?? 0) > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = query<UserRow>(
      'SELECT id, email FROM users WHERE email = ?',
      [email],
    );
    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return User.reconstitute(row.id, row.email);
  }

  async findById(userId: string): Promise<User | null> {
    const result = query<UserRow>('SELECT id, email FROM users WHERE id = ?', [
      userId,
    ]);
    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return User.reconstitute(row.id, row.email);
  }
}
