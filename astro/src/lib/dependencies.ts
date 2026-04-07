import type { IAuthorizationService } from '@services/authorization-service.ts';
import type { TeamsRepository } from '@database/teams-repository.ts';
import type { SurveyRunRepository } from '@database/survey-run-repository.ts';
import type { UsersRepository } from '@database/users-repository.ts';
import type { SurveyModelRepository } from '@database/survey-model-repository.ts';
import type { DoraCapabilityRepository } from '@database/dora-capability-repository.ts';

export interface Dependencies {
  authorizationService: IAuthorizationService;
  teamsRepository: TeamsRepository;
  surveyRunRepository: SurveyRunRepository;
  usersRepository: UsersRepository;
  surveyModelRepository: SurveyModelRepository;
  doraCapabilityRepository: DoraCapabilityRepository;
}
