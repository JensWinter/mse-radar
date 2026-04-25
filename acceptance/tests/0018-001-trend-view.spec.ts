import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0018-001: Trend View', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const nonMemberEmail = 'outsider@example.com';
  const teamName = 'Road Runners';
  const runTitles = ['Sprint 1', 'Sprint 2', 'Sprint 3'];

  async function runSurveyCycle(
    title: string,
    answers: number[],
  ) {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName, title });
    await dsl.surveyExecution.openSurveyRun({ teamName, title });

    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName, title });
    await dsl.surveyExecution.answerSurvey({ answers });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName, title });
  }

  beforeEach(async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.registerUser({ email: nonMemberEmail });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });
  });

  it('shows capability scores compared across multiple survey runs', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a team has completed multiple surveys
    await runSurveyCycle(runTitles[0], [2, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
    await runSurveyCycle(runTitles[1], [3, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    await runSurveyCycle(runTitles[2], [4, 5, 5, 5, 5, 5, 5, 5, 5, 5]);

    // WHEN I view the trend view for that team
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.viewTrendView({ teamName });

    // THEN I see capability scores compared across all surveys
    await dsl.surveyExecution.confirmTrendVisualizationDisplayed();
    await dsl.surveyExecution.confirmTrendCardsHaveSurveyCount({
      expectedSurveyCount: 3,
    });
  });

  it('lets a team member see whether a capability improved or declined', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a team has completed multiple surveys
    await runSurveyCycle(runTitles[0], [2, 4, 3]);
    await runSurveyCycle(runTitles[1], [6, 1, 3]);

    // WHEN I view the trend view for that team
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.viewTrendView({ teamName });

    // THEN I see whether a capability improved or declined
    await dsl.surveyExecution.confirmTrendVisualizationDisplayed();
    await dsl.surveyExecution.confirmDoraCapabilityImproved({
      doraCapabilityName: 'Version control',
      fromRunTitle: runTitles[0],
      toRunTitle: runTitles[1],
    });
    await dsl.surveyExecution.confirmDoraCapabilityDeclined({
      doraCapabilityName: 'Trunk-based development',
      fromRunTitle: runTitles[0],
      toRunTitle: runTitles[1],
    });
    await dsl.surveyExecution.confirmDoraCapabilityRemainedUnchanged({
      doraCapabilityName: 'Code maintainability',
      fromRunTitle: runTitles[0],
      toRunTitle: runTitles[1],
    });
  });

  it('shows survey runs in chronological order on the timeline', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a team has completed multiple surveys
    await runSurveyCycle(runTitles[0], [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
    await runSurveyCycle(runTitles[1], [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    await runSurveyCycle(runTitles[2], [5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);

    // WHEN I view the trend view for that team
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.viewTrendView({ teamName });

    // THEN I see the survey results in chronological order
    await dsl.surveyExecution.confirmRunsInChronologicalOrder({
      expectedTitlesInOrder: runTitles,
    });
  });

  it('denies non-team members access to the trend view', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a team has completed a survey
    await runSurveyCycle(runTitles[0], [1, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
    await runSurveyCycle(runTitles[1], [2, 4, 4, 4, 4, 4, 4, 4, 4, 4]);

    // WHEN I view the trend view for that team as a non-team member
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.viewTrendView({ teamName });

    // THEN I see a clear message that I am not authorized
    await dsl.identityAndAccess.signIn({ email: nonMemberEmail });
    await dsl.surveyExecution.attemptToViewTrendView();
    await dsl.surveyExecution.confirmAccessDenied();
  });
});
