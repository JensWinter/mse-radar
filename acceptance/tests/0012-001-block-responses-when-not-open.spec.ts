import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0012-001: Block Responses When Survey Not Open', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const teamName = 'Road Runners';

  beforeEach(async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });
  });

  it('should show "not yet open" message when survey is in pending state', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN
    await dsl.surveyExecution.createSurveyRun({ teamName });

    // WHEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN
    await dsl.surveyExecution.confirmSurveyNotYetOpen();
  });

  it('should show "closed" message when survey is closed', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN
    await dsl.surveyExecution.confirmSurveyRunClosed();
  });

  it('should show "no survey available" message when no survey run exists', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN
    // Nothing to arrange (Set up team in beforeEach)

    // WHEN
    await dsl.teamManagement.openTeamDetails({ teamName });

    // THEN
    await dsl.surveyExecution.confirmNoSurveyAvailable();
  });

  it('should accept response when survey is open', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });

    // WHEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey();

    // THEN
    await dsl.surveyExecution.confirmResponseSaved({ teamName });
  });
});
