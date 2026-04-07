import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0009-002: Close Survey Run', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const teamName = 'Road Runners';

  beforeEach(async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });
  });

  it('should stop accepting responses when survey run is closed', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN Team lead has an open survey run
    // (Survey run created and opened in beforeEach)

    // WHEN Team lead closes the survey run
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // THEN Survey run status is 'closed'
    await dsl.surveyExecution.confirmSurveyRunDetails({ status: 'closed' });
    await dsl.surveyExecution.confirmSurveyRunClosed();
    await dsl.surveyExecution.confirmCannotAnswerSurvey();
  });

  it('should show clear message when team members try to submit responses to closed survey', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN A survey run is closed
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN Team member attempts to submit responses to the survey
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN They see a clear message that the survey is closed
    await dsl.surveyExecution.confirmSurveyRunClosed();
  });

  it('should display aggregated capability scores when survey run is closed', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN A survey run has submitted responses
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey();

    // WHEN Team lead closes the survey run
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // THEN Assessment results section is displayed with capability scores
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmCapabilityScoresDisplayed();
  });

  it('should not allow regular team member to close survey run', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN I am a regular team member (not team lead)
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });

    // WHEN I navigate to the survey run details page
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN The Close button is not visible
    await dsl.surveyExecution.confirmClosingSurveyRunIsNotPossible();
  });
});
