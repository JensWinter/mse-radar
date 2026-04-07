import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0009-001: Open Survey Run', () => {
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
  });

  it('should accept survey responses when survey opened', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN
    // Nothing to arrange (Survey Run created in beforeEach)

    // WHEN
    await dsl.surveyExecution.openSurveyRun({ teamName });

    // THEN
    await dsl.surveyExecution.confirmSurveyRunDetails({ status: 'open' });
    await dsl.surveyExecution.confirmAcceptsSurveyResponse({ teamName });
  });

  it('should allow team member to submit survey responses', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN
    await dsl.surveyExecution.openSurveyRun({ teamName });
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // WHEN
    await dsl.surveyExecution.answerSurvey();

    // THEN
    await dsl.surveyExecution.confirmResponseSaved({ teamName });
  });

  it('should not allow opening another survey run if one is already open', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN
    await dsl.surveyExecution.openSurveyRun({ teamName });

    // WHEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN
    await dsl.surveyExecution.confirmOpeningSurveyRunIsNotPossible();
  });

  it('should not allow team member to open survey run', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });

    // WHEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN
    await dsl.surveyExecution.confirmOpeningSurveyRunIsNotPossible();
  });
});
