import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0011-002: Edit Survey Response', () => {
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

  it('should replace previous answers when editing response while survey is open', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN user has submitted a response with initial answers
    const initialAnswers = [1, 2, 3, 4, 5, 6, 7, 1, 2];
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: initialAnswers });

    // WHEN user edits with new answers
    const updatedAnswers = [7, 6, 5, 4, 3, 2, 1, 7, 6];
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: updatedAnswers });

    // THEN updated answers are saved and displayed

    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.confirmMyAnswers({ answers: updatedAnswers });
  });

  it('should use only most recent submission when survey closes after multiple edits', async () => {
    assertExists(dsl.surveyExecution);
    assertExists(dsl.identityAndAccess);

    // GIVEN team member submits and edits multiple times
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });

    const firstAnswers = [1, 1, 1, 1, 1, 1, 1, 1, 1];
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: firstAnswers });

    const secondAnswers = [4, 4, 4, 4, 4, 4, 4, 4, 4];
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: secondAnswers });

    const finalAnswers = [7, 7, 7, 7, 7, 7, 7, 7, 7];
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: finalAnswers });

    // WHEN survey is closed
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // THEN results reflect only the most recent submission (all 7s = score of 7)
    await dsl.surveyExecution.viewAssessmentResults({ teamName });
    await dsl.surveyExecution.confirmTotalResponsesCount({ expectedCount: 1 });
  });

  it('should show clear message when trying to edit response after survey is closed', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN User has submitted a response and the survey is closed
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey();

    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN User tries to access the survey page to edit response
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN User sees a message that the survey is closed
    await dsl.surveyExecution.confirmSurveyRunClosed();
  });

  it('should display updated answers when viewing submission after edit', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN user has submitted a response
    const initialAnswers = [1, 2, 3, null, 5, 6, 7, null, 1];
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: initialAnswers });

    // WHEN user edits their response
    const updatedAnswers = [7, 6, 5, 4, 3, 2, 1, null, 7];
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: updatedAnswers });

    // THEN user sees updated answers (not the original ones)
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.confirmMyAnswers({ answers: updatedAnswers });
  });
});
