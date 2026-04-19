import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0017-001: Tailored Improvement Guidance', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const teamName = 'Road Runners';
  const capabilityName = 'Code maintainability';
  const level4GuidanceText =
    'Run automated tests on normal code changes and on dependency upgrades before changes are merged or released. Strengthen review workflows so cross-team changes can be proposed, reviewed, and audited without needing special side channels. Make it easier to search for examples and reusable components so teams can reuse existing code instead of reimplementing it. Track how often dependency updates fail and where manual coordination still slows changes.';

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
    await dsl.surveyExecution.answerSurvey({
      answers: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    });

    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.surveyExecution.closeSurveyRun({ teamName });
  });

  it('should show improvement guidance for a specific capability from closed survey results', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a survey run with closed results
    // (Survey run created and opened in beforeEach)

    // WHEN a team member views the assessment results
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.viewAssessmentResults({ teamName });
    await dsl.surveyExecution.accessGuidanceForCapability({ capabilityName });

    // THEN she sees the guidance for the specified capability
    await dsl.surveyExecution.confirmGuidanceDisplayed({ capabilityName });
  });

  it('should tailor guidance to the assessed capability level', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a closed survey run with a level 4 score for a capability
    // (Survey run created, opened, answered with 4s, and closed in beforeEach)

    // WHEN a team member views the assessment results
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.viewAssessmentResults({ teamName });
    await dsl.surveyExecution.accessGuidanceForCapability({ capabilityName });

    // THEN the guidance reflects level 4 for that capability
    await dsl.surveyExecution.confirmGuidanceText({
      text: level4GuidanceText,
    });
  });

  it('should show actionable advice and its DORA source', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.surveyExecution);

    // GIVEN a closed survey run with a level 4 score for a capability
    // (Survey run created, opened, answered with 4s, and closed in beforeEach)

    // WHEN a team member views the guidance for a capability
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.surveyExecution.viewAssessmentResults({ teamName });
    await dsl.surveyExecution.accessGuidanceForCapability({ capabilityName });

    // THEN the guidance contains actionable advice and its DORA source
    await dsl.surveyExecution.confirmGuidanceContainsActionableAdvice();
    await dsl.surveyExecution.confirmGuidanceShowsDoraSource();
  });
});
