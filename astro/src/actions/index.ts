import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { PgUsersRepository } from '@database/users-repository.ts';
import { PgTeamsRepository } from '@database/teams-repository.ts';
import {
  TeamNameAlreadyExistsError,
  TeamsService,
  UserNotFoundError,
} from '@services/teams-service.ts';
import {
  CannotDemoteLastTeamLeadError,
  CannotRemoveLastTeamLeadError,
  MemberNotFoundError,
  UserAlreadyTeamMemberError,
} from '@models/aggregates/team.ts';
import {
  type AnswerValue,
  InvalidSurveyRunTitleError,
} from '@models/aggregates/survey-run.ts';
import { SurveyRunService } from '@services/survey-run-service.ts';
import { PgSurveyRunRepository } from '@database/survey-run-repository.ts';
import {
  AuthorizationError,
  AuthorizationService,
} from '@services/authorization-service.ts';
import type { User } from '@models/aggregates/user.ts';
import { UsersService } from '@services/users-service.ts';

function createAuthorizationService(user: User): AuthorizationService {
  return new AuthorizationService(user, new PgTeamsRepository());
}

function createUsersService(): UsersService {
  return new UsersService(new PgUsersRepository());
}

function createTeamsService(user: User) {
  return new TeamsService(
    createAuthorizationService(user),
    new PgTeamsRepository(),
    createUsersService(),
  );
}

function createSurveyRunService(user: User) {
  return new SurveyRunService(
    createAuthorizationService(user),
    new PgSurveyRunRepository(),
    new PgTeamsRepository(),
  );
}

function mapInputToAnswerValue(input: number | undefined): AnswerValue | null {
  if (input === undefined) {
    return null;
  }

  if ([1, 2, 3, 4, 5, 6, 7].includes(input)) {
    return input as AnswerValue;
  }

  return null;
}

export const server = {
  createTeam: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const teamsService = createTeamsService(context.locals.user);
      try {
        const teamId = await teamsService.createTeam(
          input.name,
          input.description || null,
        );
        return { success: true, teamId };
      } catch (error) {
        if (error instanceof TeamNameAlreadyExistsError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'A team with this name already exists',
          });
        }
        throw error;
      }
    },
  }),

  addTeamMember: defineAction({
    accept: 'form',
    input: z.object({
      teamId: z.string(),
      teamMemberEmail: z.email(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const teamsService = createTeamsService(context.locals.user);
      try {
        await teamsService.addMemberToTeam(input.teamId, input.teamMemberEmail);
        return { success: true };
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: error.message,
          });
        }
        if (error instanceof UserNotFoundError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        if (error instanceof UserAlreadyTeamMemberError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Failed to add team member',
        });
      }
    },
  }),

  removeTeamMember: defineAction({
    accept: 'form',
    input: z.object({
      teamId: z.string(),
      memberEmail: z.email(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const teamsService = createTeamsService(context.locals.user);
      try {
        await teamsService.removeMemberFromTeam(
          input.teamId,
          input.memberEmail,
        );
        return { success: true };
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: error.message,
          });
        }
        if (error instanceof UserNotFoundError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        if (error instanceof MemberNotFoundError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        if (error instanceof CannotRemoveLastTeamLeadError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Failed to remove team member',
        });
      }
    },
  }),

  changeMemberRole: defineAction({
    accept: 'form',
    input: z.object({
      teamId: z.string(),
      memberEmail: z.email(),
      newRole: z.enum(['team-lead', 'regular-member']),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const teamsService = createTeamsService(context.locals.user);
      try {
        await teamsService.changeMemberRole(
          input.teamId,
          input.memberEmail,
          input.newRole,
        );
        return { success: true };
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: error.message,
          });
        }
        if (error instanceof UserNotFoundError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        if (error instanceof MemberNotFoundError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        if (error instanceof CannotDemoteLastTeamLeadError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Failed to change member role',
        });
      }
    },
  }),

  updateTeam: defineAction({
    accept: 'form',
    input: z.object({
      teamId: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const teamsService = createTeamsService(context.locals.user);
      try {
        await teamsService.updateTeam(
          input.teamId,
          input.name,
          input.description || null,
        );
        return { success: true };
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Only team leads can edit team details',
          });
        }
        if (error instanceof TeamNameAlreadyExistsError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'A team with this name already exists',
          });
        }
        throw error;
      }
    },
  }),

  createSurveyRun: defineAction({
    accept: 'form',
    input: z.object({
      teamId: z.string(),
      surveyModelId: z.string(),
      title: z.string().min(1, 'Title is required').trim(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const surveyRunService = createSurveyRunService(context.locals.user);
      try {
        const surveyRunId = await surveyRunService.createSurveyRun(
          input.teamId,
          input.surveyModelId,
          input.title,
        );
        return { success: true, surveyRunId };
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: error.message,
          });
        }
        if (error instanceof InvalidSurveyRunTitleError) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Failed to create survey run',
        });
      }
    },
  }),

  openSurveyRun: defineAction({
    accept: 'form',
    input: z.object({
      surveyRunId: z.string(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const surveyRunService = createSurveyRunService(context.locals.user);
      try {
        await surveyRunService.openSurveyRun(input.surveyRunId);
        return { success: true };
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: error.message,
          });
        }
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Failed to open survey run',
        });
      }
    },
  }),

  closeSurveyRun: defineAction({
    accept: 'form',
    input: z.object({
      surveyRunId: z.string(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const surveyRunService = createSurveyRunService(context.locals.user);
      try {
        await surveyRunService.closeSurveyRun(input.surveyRunId);
        return { success: true };
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: error.message,
          });
        }
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Failed to close survey run',
        });
      }
    },
  }),

  reopenSurveyRun: defineAction({
    accept: 'form',
    input: z.object({
      surveyRunId: z.string(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const surveyRunService = createSurveyRunService(context.locals.user);
      try {
        await surveyRunService.reopenSurveyRun(input.surveyRunId);
        return { success: true };
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: error.message,
          });
        }
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Failed to reopen survey run',
        });
      }
    },
  }),

  saveAnswer: defineAction({
    input: z.object({
      surveyRunId: z.string(),
      questionIndex: z.number().int().min(0),
      type: z.enum(['answer', 'comment']),
      answerValue: z.number().optional(),
      comment: z.string().optional(),
    }),
    handler: async (input, context) => {
      const { user } = context.locals;
      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      const surveyRunService = createSurveyRunService(user);
      try {
        switch (input.type) {
          case 'answer':
            await surveyRunService.saveAnswer(
              input.surveyRunId,
              input.questionIndex,
              mapInputToAnswerValue(input.answerValue),
            );
            break;
          case 'comment':
            await surveyRunService.saveComment(
              input.surveyRunId,
              input.questionIndex,
              input.comment ?? '',
            );
            break;
          default:
            break;
        }
        return { success: true };
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: error.message,
          });
        }
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Failed to save answer',
        });
      }
    },
  }),
};
