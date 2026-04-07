import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import Database from 'better-sqlite3';
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  AUTH_DB_PATH,
} from 'astro:env/server';
import { UsersService } from '@services/users-service.ts';
import { SqliteUsersRepository } from '@database/users-repository.ts';

export const auth = betterAuth({
  database: new Database(AUTH_DB_PATH),
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        const returned = ctx.context.returned as any;
        if (!returned.statusCode) {
          const usersService = new UsersService(new SqliteUsersRepository());
          await usersService.createUser(returned.user.email);
        }
      }
    }),
  },
});
