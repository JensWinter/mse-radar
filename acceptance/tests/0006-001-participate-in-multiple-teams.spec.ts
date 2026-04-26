import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0006-001: Participate in Multiple Teams', () => {
  const userEmail = 'multiuser@example.com';
  const teamALeadEmail = 'teamalead@example.com';
  const teamBLeadEmail = 'teamblead@example.com';
  const teamAName = 'Team Alpha';
  const teamBName = 'Team Beta';
  const teamADescription = 'First team for testing';
  const teamBDescription = 'Second team for testing';

  it('should see all teams in team list when member of multiple teams', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am a member of multiple teams
    await dsl.identityAndAccess.registerUser({ email: userEmail });
    await dsl.identityAndAccess.registerUser({ email: teamALeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamBLeadEmail });

    // Create Team A and add user as member
    await dsl.identityAndAccess.signIn({ email: teamALeadEmail });
    await dsl.teamManagement.createTeam({ name: teamAName, description: teamADescription });
    await dsl.teamManagement.addTeamMember({ teamName: teamAName, email: userEmail });

    // Create Team B and add user as member
    await dsl.identityAndAccess.signIn({ email: teamBLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamBName, description: teamBDescription });
    await dsl.teamManagement.addTeamMember({ teamName: teamBName, email: userEmail });

    // WHEN I sign in and view the home page
    await dsl.identityAndAccess.signIn({ email: userEmail });
    await dsl.teamManagement.openHomePage();

    // THEN I see all my teams in my team list
    await dsl.teamManagement.confirmTeamInList({ teamName: teamAName });
    await dsl.teamManagement.confirmTeamInList({ teamName: teamBName });
  });

  it('should see only survey runs for the team I am currently viewing', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN I am a member of Team A and Team B
    await dsl.identityAndAccess.registerUser({ email: userEmail });
    await dsl.identityAndAccess.registerUser({ email: teamALeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamBLeadEmail });

    // Create Team A with a survey run
    await dsl.identityAndAccess.signIn({ email: teamALeadEmail });
    await dsl.teamManagement.createTeam({ name: teamAName, description: teamADescription });
    await dsl.teamManagement.addTeamMember({ teamName: teamAName, email: userEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName: teamAName });

    // Create Team B with a survey run
    await dsl.identityAndAccess.signIn({ email: teamBLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamBName, description: teamBDescription });
    await dsl.teamManagement.addTeamMember({ teamName: teamBName, email: userEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName: teamBName });

    // WHEN I sign in as the multi-team user and view Team A's details
    await dsl.identityAndAccess.signIn({ email: userEmail });
    await dsl.teamManagement.openTeamDetails({ teamName: teamAName });

    // THEN I see only Team A's survey run (1 survey run)
    await dsl.teamManagement.confirmTeamDetails({
      teamName: teamAName,
      description: teamADescription,
      teamLeadEmail: teamALeadEmail,
      numberOfSurveyRuns: 1,
    });

    // WHEN I view Team B's details
    await dsl.teamManagement.openTeamDetails({ teamName: teamBName });

    // THEN I see only Team B's survey run (1 survey run)
    await dsl.teamManagement.confirmTeamDetails({
      teamName: teamBName,
      description: teamBDescription,
      teamLeadEmail: teamBLeadEmail,
      numberOfSurveyRuns: 1,
    });
  });

  it('should see separate results for each team', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // GIVEN I participate in surveys for different teams
    await dsl.identityAndAccess.registerUser({ email: userEmail });
    await dsl.identityAndAccess.registerUser({ email: teamALeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamBLeadEmail });

    // Create Team A, add user, create a survey run, open it
    await dsl.identityAndAccess.signIn({ email: teamALeadEmail });
    await dsl.teamManagement.createTeam({ name: teamAName, description: teamADescription });
    await dsl.teamManagement.addTeamMember({ teamName: teamAName, email: userEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName: teamAName });
    await dsl.surveyExecution.openSurveyRun({ teamName: teamAName });

    // Create Team B, add user, create a survey run, open it
    await dsl.identityAndAccess.signIn({ email: teamBLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamBName, description: teamBDescription });
    await dsl.teamManagement.addTeamMember({ teamName: teamBName, email: userEmail });
    await dsl.surveyExecution.createSurveyRun({ teamName: teamBName });
    await dsl.surveyExecution.openSurveyRun({ teamName: teamBName });

    // User answers a survey for Team A with specific answers
    await dsl.identityAndAccess.signIn({ email: userEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName: teamAName });
    await dsl.surveyExecution.answerSurvey({ answers: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5] });

    // User answers a survey for Team B with different answers
    await dsl.surveyExecution.openSurveyRunPage({ teamName: teamBName });
    await dsl.surveyExecution.answerSurvey({ answers: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3] });

    // Team lead closes Team A's survey
    await dsl.identityAndAccess.signIn({ email: teamALeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName: teamAName });

    // Team lead closes Team B's survey
    await dsl.identityAndAccess.signIn({ email: teamBLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName: teamBName });

    // WHEN I view results for Team A
    await dsl.identityAndAccess.signIn({ email: userEmail });
    await dsl.surveyExecution.viewAssessmentResults({ teamName: teamAName });

    // THEN I see Team A's results (with a score of 5)
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmCapabilityScoresDisplayed();

    // WHEN I view results for Team B
    await dsl.surveyExecution.viewAssessmentResults({ teamName: teamBName });

    // THEN I see Team B's results (separate from Team A)
    await dsl.surveyExecution.confirmAssessmentResultsDisplayed();
    await dsl.surveyExecution.confirmCapabilityScoresDisplayed();
  });
});
