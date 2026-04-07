import { defineMiddleware, sequence } from 'astro:middleware';
import { UsersService } from '@services/users-service.ts';
import { SqliteUsersRepository } from '@database/users-repository.ts';
import { auth } from '../lib/auth';
import { AuthorizationService } from '@services/authorization-service.ts';
import { SqliteTeamsRepository } from '@database/teams-repository.ts';
import type { Dependencies } from '@lib/dependencies.ts';
import { SqliteSurveyRunRepository } from '@database/survey-run-repository.ts';
import { SqliteSurveyModelRepository } from '@database/survey-model-repository.ts';
import { SqliteDoraCapabilityRepository } from '@database/dora-capability-repository.ts';

function createUsersService(): UsersService {
  return new UsersService(new SqliteUsersRepository());
}

async function resolveDomainUser(email: string) {
  const usersService = createUsersService();
  return usersService.getOrCreateUser(email);
}

export const onRequest = sequence(
  defineMiddleware(async (context, next) => {
    const isAuthed = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (isAuthed) {
      context.locals.user = await resolveDomainUser(isAuthed.user.email);
    } else {
      context.locals.user = null;
    }

    return await next();
  }),

  defineMiddleware(async (context, next) => {
    const currentUser = context.locals.user;
    if (!currentUser) return await next();

    const authorizationService = new AuthorizationService(
      currentUser,
      new SqliteTeamsRepository(),
    );
    const usersService = createUsersService();
    const teamsRepository = new SqliteTeamsRepository();
    const surveyRunRepository = new SqliteSurveyRunRepository();
    const usersRepository = new SqliteUsersRepository();
    const surveyModelRepository = new SqliteSurveyModelRepository();
    const doraCapabilityRepository = new SqliteDoraCapabilityRepository();

    Object.assign(context.locals, {
      authorizationService,
      usersService,
      teamsRepository,
      surveyRunRepository,
      usersRepository,
      surveyModelRepository,
      doraCapabilityRepository,
    } satisfies Dependencies);

    return await next();
  }),

  defineMiddleware(async (context, next) => {
    const publicPages = ['/', '/login', '/register', '/api/auth/[...all]'];
    if (publicPages.includes(context.routePattern) || !!context.locals.user) {
      return next();
    }

    return context.redirect('/login');
  }),
);
