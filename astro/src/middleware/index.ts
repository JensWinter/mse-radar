import { defineMiddleware, sequence } from 'astro:middleware';
import { UsersService } from '@services/users-service.ts';
import { PgUsersRepository } from '@database/users-repository.ts';
import { auth } from '../lib/auth';
import { AuthorizationService } from '@services/authorization-service.ts';
import { PgTeamsRepository } from '@database/teams-repository.ts';
import type { Dependencies } from '@lib/dependencies.ts';
import { PgSurveyRunRepository } from '@database/survey-run-repository.ts';
import { PgSurveyModelRepository } from '@database/survey-model-repository.ts';
import { PgDoraCapabilityRepository } from '@database/dora-capability-repository.ts';

function createUsersService(): UsersService {
  return new UsersService(new PgUsersRepository());
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
      new PgTeamsRepository(),
    );
    const usersService = createUsersService();
    const teamsRepository = new PgTeamsRepository();
    const surveyRunRepository = new PgSurveyRunRepository();
    const usersRepository = new PgUsersRepository();
    const surveyModelRepository = new PgSurveyModelRepository();
    const doraCapabilityRepository = new PgDoraCapabilityRepository();

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
