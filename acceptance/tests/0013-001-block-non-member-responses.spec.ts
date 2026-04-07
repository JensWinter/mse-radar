import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0013-001: Block Non-Member Responses', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const nonMemberEmail = 'carol@example.com';
  const teamName = 'Road Runners';

  it('should deny access when non-member tries to respond to survey', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN I am not a member of a team with an open survey
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: nonMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });

    // WHEN I (non-member) try to access the survey response page
    await dsl.identityAndAccess.signIn({ email: nonMemberEmail });
    await dsl.surveyExecution.attemptToViewLastSurveyRun();

    // THEN I see a clear message that I am not authorized
    await dsl.surveyExecution.confirmAccessDenied();
  });

  it('should accept response when member submits to their team survey', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN I am a member of a team with an open survey
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });

    // WHEN I submit responses to our survey
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey();

    // THEN my answers are saved
    await dsl.surveyExecution.confirmResponseSaved({ teamName });
  });

  it('should deny access when removed member tries to respond to survey', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN I was removed from a team with an open survey
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });
    await dsl.teamManagement.removeTeamMember({ teamName, email: teamMemberEmail });

    // WHEN I (removed member) try to access the survey response page
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.attemptToViewLastSurveyRun();

    // THEN I see a clear message that I am not authorized
    await dsl.surveyExecution.confirmAccessDenied();
  });

  it('should deny access when non-member tries to view survey details page', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN I try to access a survey for a team I don't belong to
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: nonMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.surveyExecution.createSurveyRun({ teamName });
    // Store the survey run URL while logged in as team lead
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // WHEN I (non-member) try to view the survey details page
    await dsl.identityAndAccess.signIn({ email: nonMemberEmail });
    await dsl.surveyExecution.attemptToViewLastSurveyRun();

    // THEN I am denied access
    await dsl.surveyExecution.confirmAccessDenied();
  });
});
