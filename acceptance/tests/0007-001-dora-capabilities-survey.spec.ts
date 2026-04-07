import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0007-001: DORA Capabilities-Based Survey', () => {
  beforeEach(async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    const userEmail = 'pete@example.com';
    await dsl.identityAndAccess.registerUser({ email: userEmail });
    await dsl.identityAndAccess.signIn({ email: userEmail });
  });

  it('should display questions where each corresponds to one DORA capability', async () => {
    assertExists(dsl.surveyDefinition);

    // Given
    await dsl.surveyDefinition.openSurveyModel();

    // When
    const questions = await dsl.surveyDefinition.readSurveyQuestions();

    // Then
    await dsl.surveyDefinition.confirmQuestionsMapToDoraCapabilities({ questions });
  });

  it('should clearly indicate what capability is being assessed for each question', async () => {
    assertExists(dsl.surveyDefinition);

    // Given
    await dsl.surveyDefinition.openSurveyModel();

    // When
    const questions = await dsl.surveyDefinition.readSurveyQuestions();

    // Then
    await dsl.surveyDefinition.confirmQuestionsShowDoraCapabilityDescription({ questions });
  });

  it('should cover the full set of DORA capabilities defined by the survey model', async () => {
    assertExists(dsl.surveyDefinition);

    // Given
    await dsl.surveyDefinition.openSurveyModel();

    // When
    const questions = await dsl.surveyDefinition.readSurveyQuestions();

    // Then
    await dsl.surveyDefinition.confirmAllDoraCapabilitiesAreCovered({ questions });
  });
});
