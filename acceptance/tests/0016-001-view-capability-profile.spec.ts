import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0016-001: View Capability Profile', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMember1Email = 'murat@example.com';
  const teamMember2Email = 'laura@example.com';
  const nonMemberEmail = 'outsider@example.com';
  const teamName = 'Road Runners';

  beforeEach(async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMember1Email });
    await dsl.identityAndAccess.registerUser({ email: teamMember2Email });
    await dsl.identityAndAccess.registerUser({ email: nonMemberEmail });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMember1Email });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMember2Email });

    await dsl.surveyExecution.createSurveyRun({ teamName });
    await dsl.surveyExecution.openSurveyRun({ teamName });
  });

  it('should display a visual representation of all capability scores when viewing the capability profile', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a survey run is closed with results
    await dsl.identityAndAccess.signIn({ email: teamMember1Email });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey({ answers: [5, 6, 4, 7, 3, 5, 6, 4, 7, 3] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN I view the capability profile
    await dsl.surveyExecution.viewCapabilityProfile({ teamName });

    // THEN I see a visual representation of all capability scores
    await dsl.surveyExecution.confirmCapabilityProfileVisualizationDisplayed();
  });

  it('should allow easy identification of maturity levels for each capability', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN I view the capability profile with varying scores
    await dsl.identityAndAccess.signIn({ email: teamMember1Email });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    // Varied answers: some high (6,7), some low (1,2), some medium (4,5)
    await dsl.surveyExecution.answerSurvey({ answers: [7, 2, 6, 1, 5, 7, 2, 6, 1, 4] });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN I look at the visualization
    await dsl.surveyExecution.viewCapabilityProfile({ teamName });

    // THEN I can easily identify the maturity level of each capability
    await dsl.surveyExecution.confirmMaturityLevelsIdentifiable();
  });

  it('should show the latest survey run capability profile by default when accessing results', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);
    assertExists(dsl.teamManagement);

    // GIVEN a survey run is closed with results
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey();

    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN I am a team member and I access the results
    await dsl.teamManagement.openTeamDetails({ teamName });
    await dsl.surveyExecution.accessLatestSurveyRunResults();

    // THEN I see the latest survey run's capability profile by default
    await dsl.surveyExecution.confirmCapabilityProfileVisualizationDisplayed();
  });

  it('should deny access to capability profile for non-team members', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a survey run is closed with results
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
    await dsl.surveyExecution.answerSurvey();

    await dsl.surveyExecution.closeSurveyRun({ teamName });

    // WHEN I am not a member of the team and I try to view their capability profile
    await dsl.identityAndAccess.signIn({ email: nonMemberEmail });
    await dsl.surveyExecution.attemptToViewCapabilityProfile();

    // THEN I am denied access
    await dsl.surveyExecution.confirmAccessDenied();
  });
});
