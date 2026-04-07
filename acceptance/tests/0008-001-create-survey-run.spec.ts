import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0008-001: Create Survey Run', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const teamName = 'Road Runners';

  beforeEach(async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });
  });

  it('should create a new survey run', async () => {
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // Given
    const title = 'Sprint 123';

    // When
    await dsl.surveyExecution.createSurveyRun({ teamName, title });

    // Then
    await dsl.teamManagement.confirmTeamDetails({
      teamName,
      teamLeadEmail,
      numberOfSurveyRuns: 1,
    });
    await dsl.surveyExecution.confirmSurveyRunIsListed({ teamName, title });
  });

  it('should list the new survey run in the team details page', async () => {
    assertExists(dsl.surveyExecution);
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // Given
    await dsl.surveyExecution.createSurveyRun({ teamName });

    // When
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.teamManagement.openTeamDetails({ teamName });

    // Then
    await dsl.teamManagement.confirmTeamDetails({
      teamName,
      teamLeadEmail,
      numberOfSurveyRuns: 1,
    });
  });

  it('should deny access to survey run creation for non-team leads', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);
    assertExists(dsl.surveyExecution);

    // Given
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });

    // When
    await dsl.teamManagement.openTeamDetails({ teamName });

    // Then
    await dsl.surveyExecution.confirmCreatingSurveyRunNotPossible();
  });

  it('should view details of newly created survey run', async () => {
    assertExists(dsl.surveyExecution);

    // Given
    await dsl.surveyExecution.createSurveyRun({ teamName });

    // When
    await dsl.surveyExecution.openSurveyRunPage({ teamName });

    // Then
    await dsl.surveyExecution.confirmSurveyRunDetails();
  });
});
