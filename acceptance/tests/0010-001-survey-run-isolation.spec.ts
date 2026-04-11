import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0010-001: Survey Run Isolation', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const teamName = 'Road Runners';
  const firstSurveyTitle = 'Sprint 1';
  const secondSurveyTitle = 'Sprint 2';
  const thirdSurveyTitle = 'Sprint 3';

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

  it('should show only data from specific survey run when viewing it', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN my team has completed multiple survey runs with different responses
    await dsl.surveyExecution.createSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.surveyExecution.openSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.surveyExecution.answerSurvey({ answers: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });

    await dsl.surveyExecution.createSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.surveyExecution.openSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.surveyExecution.answerSurvey({ answers: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });

    // WHEN I view the first survey run
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: firstSurveyTitle,
    });

    // THEN I see only the responses and results from that run (score should be 2.0)
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmTotalResponsesCount({ expectedCount: 1 });
    await dsl.surveyExecution.confirmAggregatedScoreForCapability({
      capabilityName: 'Continuous integration',
      expectedScore: 2.0,
    });
  });

  it('should preserve old responses when submitting to new survey run', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN I have submitted responses to a survey run
    await dsl.surveyExecution.createSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.surveyExecution.openSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.surveyExecution.answerSurvey({ answers: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });

    // AND I submit responses to a new survey run with different answers
    await dsl.surveyExecution.createSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.surveyExecution.openSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.surveyExecution.answerSurvey({ answers: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });

    // WHEN I view the previous (first) survey run
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: firstSurveyTitle,
    });

    // THEN my old responses remain unchanged (score should still be 3.0, not 7.0)
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmAggregatedScoreForCapability({
      capabilityName: 'Continuous integration',
      expectedScore: 3.0,
    });
  });

  it('should display all survey runs in team history', async () => {
    assertExists(dsl.surveyExecution);
    assertExists(dsl.teamManagement);

    // GIVEN my team has multiple historical survey runs
    await dsl.surveyExecution.createSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.surveyExecution.openSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.surveyExecution.closeSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });

    await dsl.surveyExecution.createSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.surveyExecution.openSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.surveyExecution.closeSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });

    await dsl.surveyExecution.createSurveyRun({
      teamName,
      title: thirdSurveyTitle,
    });

    // WHEN I view the team's survey history
    await dsl.teamManagement.openTeamDetails({ teamName });

    // THEN I see a list of all past survey runs (3 runs total)
    await dsl.surveyExecution.confirmSurveyRunCount({ expectedCount: 3 });
  });

  it('should show independent results for each closed survey run', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN my team has multiple closed survey runs with different responses
    await dsl.surveyExecution.createSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.surveyExecution.openSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: firstSurveyTitle,
    });
    await dsl.surveyExecution.answerSurvey({ answers: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({
      teamName,
      title: firstSurveyTitle,
    });

    // Second survey run: team member answers with 6s
    await dsl.surveyExecution.createSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.surveyExecution.openSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: secondSurveyTitle,
    });
    await dsl.surveyExecution.answerSurvey({ answers: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({
      teamName,
      title: secondSurveyTitle,
    });

    // WHEN I view the results of the first survey run
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: firstSurveyTitle,
    });

    // THEN it shows its own independent calculated results (score should be 2.0)
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmAggregatedScoreForCapability({
      capabilityName: 'Continuous integration',
      expectedScore: 2.0,
    });

    // WHEN I view the results of the second survey run
    await dsl.surveyExecution.openSurveyRunPage({
      teamName,
      title: secondSurveyTitle,
    });

    // THEN it shows its own independent calculated results (score should be 6.0)
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmAggregatedScoreForCapability({
      capabilityName: 'Continuous integration',
      expectedScore: 6.0,
    });
  });
});
