import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0021-001: Add Comments to Answers', () => {
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

  it('should allow adding an optional comment when answering a question', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // WHEN
    await dsl.surveyExecution.addCommentToQuestion({
      capabilityName: 'Continuous integration',
      comment: 'We improved a lot recently',
    });

    // THEN
    await dsl.surveyExecution.confirmCommentSaved({ capabilityName: 'Continuous integration' });
  });

  it('should display own comment when viewing my submission', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN
    const comment = 'This area needs more attention';
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.addCommentToQuestion({ capabilityName: 'Continuous integration', comment });

    // WHEN
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // THEN
    await dsl.surveyExecution.confirmMyComment({ capabilityName: 'Continuous integration', comment });
  });

  it('should not show individual comments in aggregated team results', async () => {
    assertExists(dsl.surveyExecution);
    assertExists(dsl.identityAndAccess);

    // GIVEN — team member answers with a comment
    const sensitiveComment = 'Confidential team feedback 12345';
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey();
    await dsl.surveyExecution.addCommentToQuestion({ capabilityName: 'Continuous integration', comment: sensitiveComment });

    // WHEN — team lead closes the survey and views results
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName });
    await dsl.surveyExecution.viewAssessmentResults({ teamName });

    // THEN — comment text is not visible in aggregated results
    await dsl.surveyExecution.confirmCommentNotInResults({ comment: sensitiveComment });
  });
});
