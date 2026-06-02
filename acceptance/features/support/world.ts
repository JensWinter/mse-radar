import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Dsl } from '../../dsl/Dsl.ts';
import { getScenarioToken, getSharedDsl } from './hooks.ts';

export type SurveyQuestion = {
  questionText: string;
  doraCapabilityName: string;
  doraCapabilityDescription: string;
};

/**
 * Cucumber World exposing the four-layer DSL to step definitions.
 *
 * The browser + SUT are shared per worker process (see hooks.ts); the World
 * simply references the shared {@link Dsl} and the current scenario's token.
 * Steps must contain no logic — they delegate straight to the DSL.
 *
 * `surveyQuestions` is per-scenario scratch state for steps that read data in a
 * When and assert over it in a Then (e.g. the DORA survey model feature).
 */
export class McRadarWorld extends World {
  surveyQuestions: SurveyQuestion[] = [];

  get dsl(): Dsl {
    return getSharedDsl();
  }

  get token(): string {
    return getScenarioToken();
  }
}

setWorldConstructor(McRadarWorld);
