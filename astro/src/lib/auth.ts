import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import pg from 'pg';
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  DATABASE_URL,
} from 'astro:env/server';
import { UsersService } from '@services/users-service.ts';
import { PgUsersRepository } from '@database/users-repository.ts';

const { Pool } = pg;

export const auth = betterAuth({
  database: new Pool({ connectionString: DATABASE_URL }),
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: { modelName: 'auth_user' },
  session: { modelName: 'auth_session' },
  account: { modelName: 'auth_account' },
  verification: { modelName: 'auth_verification' },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        const returned = ctx.context.returned as any;
        if (!returned.statusCode) {
          const usersService = new UsersService(new PgUsersRepository());
          await usersService.createUser(returned.user.email);
        }
      }
    }),
  },
});
