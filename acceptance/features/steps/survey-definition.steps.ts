import { Then, When } from '@cucumber/cucumber';
import { McRadarWorld } from '../support/world.ts';

/**
 * Step definitions for the Survey Definition bounded context.
 *
 * The questions read from the survey model are stashed on the World so that a
 * later Then can assert over them (DSL has no logic in the steps).
 */

When('I open the survey model', async function (this: McRadarWorld) {
  await this.dsl.surveyDefinition.openSurveyModel();
});

When('I read the survey questions', async function (this: McRadarWorld) {
  this.surveyQuestions = await this.dsl.surveyDefinition.readSurveyQuestions();
});

Then('each question maps to a DORA capability', async function (this: McRadarWorld) {
  await this.dsl.surveyDefinition.confirmQuestionsMapToDoraCapabilities({
    questions: this.surveyQuestions,
  });
});

Then('each question shows its DORA capability name', async function (this: McRadarWorld) {
  await this.dsl.surveyDefinition.confirmQuestionsShowDoraCapabilityName({
    questions: this.surveyQuestions,
  });
});

Then('all DORA capabilities are covered', async function (this: McRadarWorld) {
  await this.dsl.surveyDefinition.confirmAllDoraCapabilitiesAreCovered({
    questions: this.surveyQuestions,
  });
});
