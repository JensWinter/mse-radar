import { AssessmentService } from '@services/assessment-service.ts';
import { DoraCapabilitiesService } from '@services/dora-capabilities-service.ts';
import { GuidanceService } from '@services/guidance-service.ts';
import { SurveyModelService } from '@services/survey-model-service.ts';
import { SurveyRunService } from '@services/survey-run-service.ts';
import { TeamsService } from '@services/teams-service.ts';
import type { Dependencies } from '@lib/dependencies.ts';
import { GetSurveyRunCapabilityGuidanceUseCase } from '@use-cases/get-survey-run-capability-guidance.ts';
import { GetSurveyRunDetailsUseCase } from '@use-cases/get-survey-run-details.ts';
import { GetTeamOverviewUseCase } from '@use-cases/get-team-overview.ts';

export function createTeamsService({
  authorizationService,
  teamsRepository,
  usersRepository,
}: Pick<
  Dependencies,
  'authorizationService' | 'teamsRepository' | 'usersRepository'
>) {
  return new TeamsService(
    authorizationService,
    teamsRepository,
    usersRepository,
  );
}

export function createSurveyRunService({
  authorizationService,
  teamsRepository,
  surveyRunRepository,
}: Pick<
  Dependencies,
  'authorizationService' | 'teamsRepository' | 'surveyRunRepository'
>) {
  return new SurveyRunService(
    authorizationService,
    surveyRunRepository,
    teamsRepository,
  );
}

export function createSurveyModelService({
  surveyModelRepository,
}: Pick<Dependencies, 'surveyModelRepository'>) {
  return new SurveyModelService(surveyModelRepository);
}

export function createAssessmentService({
  surveyRunRepository,
  surveyModelRepository,
  doraCapabilityRepository,
}: Pick<
  Dependencies,
  'surveyRunRepository' | 'surveyModelRepository' | 'doraCapabilityRepository'
>) {
  return new AssessmentService(
    surveyRunRepository,
    surveyModelRepository,
    doraCapabilityRepository,
  );
}

export function createDoraCapabilitiesService({
  doraCapabilityRepository,
}: Pick<Dependencies, 'doraCapabilityRepository'>) {
  return new DoraCapabilitiesService(doraCapabilityRepository);
}

export function createGuidanceService({
  doraCapabilityRepository,
}: Pick<Dependencies, 'doraCapabilityRepository'>) {
  return new GuidanceService(doraCapabilityRepository);
}

export function createGetTeamOverviewUseCase(dependencies: Dependencies) {
  return new GetTeamOverviewUseCase(
    createTeamsService(dependencies),
    createSurveyRunService(dependencies),
  );
}

export function createGetSurveyRunDetailsUseCase(dependencies: Dependencies) {
  return new GetSurveyRunDetailsUseCase(
    createSurveyRunService(dependencies),
    createTeamsService(dependencies),
    createSurveyModelService(dependencies),
    createDoraCapabilitiesService(dependencies),
    createAssessmentService(dependencies),
  );
}

export function createGetSurveyRunCapabilityGuidanceUseCase(
  dependencies: Dependencies,
) {
  return new GetSurveyRunCapabilityGuidanceUseCase(
    createSurveyRunService(dependencies),
    createAssessmentService(dependencies),
    createGuidanceService(dependencies),
  );
}
