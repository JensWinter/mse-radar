import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0019-001: DORA Capability Details', () => {
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

    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.openSurveyRunPage({ teamName });
  });

  it('should show capability description and DORA link when viewing a survey question', async () => {
    assertExists(dsl.surveyExecution);

    // GIVEN I am answering a survey
    // (set up in beforeEach)

    // WHEN I open the capability info for a question
    await dsl.surveyExecution.openDoraCapabilityInfo();

    // THEN I can read a detailed description
    await dsl.surveyExecution.confirmDoraCapabilityDescriptionVisible();
    // AND open the DORA website to learn more
    await dsl.surveyExecution.confirmDoraCapabilityDoraLinkVisible();
  });
});
