import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0011-001: Submit Survey Response', () => {
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

  it('should save survey response and display confirmation message when submitted', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // WHEN
    await dsl.surveyExecution.answerSurvey();

    // THEN
    await dsl.surveyExecution.confirmResponseSaved({ teamName });
  });

  it('should allow selecting values from 7-point scale for each question', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN
    // Nothing to arrange (Survey Run created and opened in beforeEach)

    // WHEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN
    await dsl.surveyExecution.confirmAllQuestionsHave7PointScale();
  });

  it('should allow answering all questions', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN
    // Nothing to arrange (Survey Run created and opened in beforeEach)

    // WHEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN
    await dsl.surveyExecution.confirmAllQuestionsAreAnswerable();
  });

  it('should display own answers when viewing my submission', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN
    const answers = [1, 2, 3, null, 4, 5, 6, 7, null];
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers });

    // WHEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN
    await dsl.surveyExecution.confirmMyAnswers({ answers });
  });
});
