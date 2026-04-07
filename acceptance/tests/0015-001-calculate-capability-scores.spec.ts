import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0015-001: Calculate Capability Scores', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMember1Email = 'murat@example.com';
  const teamMember2Email = 'laura@example.com';
  const teamName = 'Road Runners';

  beforeEach(async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMember1Email });
    await dsl.identityAndAccess.registerUser({ email: teamMember2Email });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMember1Email });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMember2Email });

    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });
  });

  it('should display a score for each DORA capability when viewing results of a closed survey run', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a survey run is closed with responses
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey();

    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN I view the results
    await dsl.surveyExecution.viewAssessmentResults({ teamName });

    // THEN I see a score for each DORA capability
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmCapabilityScoresDisplayed();
  });

  it('should reflect aggregated responses in each DORA capability score', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN multiple team members have responded
    await dsl.identityAndAccess.signIn({ email: teamMember1Email });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5] });

    await dsl.identityAndAccess.signIn({ email: teamMember2Email });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN scores are calculated and I view results
    await dsl.surveyExecution.viewAssessmentResults({ teamName });

    // THEN each DORA capability score reflects the aggregated responses
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmTotalResponsesCount({ expectedCount: 2 });
    await dsl.surveyExecution.confirmAggregatedScoreForCapability({
      capabilityName: 'Continuous Integration',
      expectedScore: 6.0,
    });
  });

  it("should display an overall summary of the team's DORA capabilities", async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a survey run is closed with responses
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey();

    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN I view the results
    await dsl.surveyExecution.viewAssessmentResults({ teamName });

    // THEN I see an overall summary of the team's DORA capabilities
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmOverallSummaryDisplayed();
  });

  it('should not display individual responses, only aggregated results', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN scores are calculated from multiple responses
    await dsl.identityAndAccess.signIn({ email: teamMember1Email });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: [3, 4, 5, 6, 7, 3, 4, 5, 6, 7] });

    await dsl.identityAndAccess.signIn({ email: teamMember2Email });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: [7, 6, 5, 4, 3, 7, 6, 5, 4, 3] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN I view the scores
    await dsl.surveyExecution.viewAssessmentResults({ teamName });

    // THEN individual responses are not visible—only aggregated results
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmIndividualResponsesNotVisible();
  });
});
