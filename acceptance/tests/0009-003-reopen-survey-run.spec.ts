import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0009-003: Reopen Survey Run', () => {
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
  });

  it('should accept responses again when survey run is reopened', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN I am a team lead with a closed survey run
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN I reopen the survey run
    await dsl.surveyExecution.reopenSurveyRun({ teamName });

    // THEN The survey run status is 'open' and the survey accepts responses again
    await dsl.surveyExecution.confirmSurveyRunDetails({ status: 'open' });
    await dsl.surveyExecution.confirmAcceptsSurveyResponse({ teamName });
  });

  it('should allow team members to edit previously submitted responses after reopen', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN A survey run is reopened
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });

    // AND A team member has submitted responses
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3] });

    // AND The survey run is closed and reopened
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName });
    await dsl.surveyExecution.reopenSurveyRun({ teamName });

    // WHEN Team member accesses the survey
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN They can edit their previously submitted responses
    await dsl.surveyExecution.answerSurvey({ answers: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5] });

    await dsl.surveyExecution.confirmResponseSaved({
      teamName,
      answers: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    });
  });

  it('should not allow reopening when survey run is already open', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN I am a team lead with an open survey run
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });

    // WHEN I navigate to the survey run details page
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN The Reopen button is not visible
    await dsl.surveyExecution.confirmReopeningSurveyRunIsNotPossible();
  });

  it('should not allow regular team member to reopen survey run', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN I am not a team lead and a reopened survey run exists
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });
    await dsl.surveyExecution.closeSurveyRun({ teamName });
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });

    // WHEN I navigate to the survey run details page
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN The Reopen button is not visible
    await dsl.surveyExecution.confirmReopeningSurveyRunIsNotPossible();
  });
});
