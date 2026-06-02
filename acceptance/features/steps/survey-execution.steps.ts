import { Given, Then, When } from '@cucumber/cucumber';
import { McRadarWorld } from '../support/world.ts';

/**
 * Step definitions for the Survey Execution bounded context.
 *
 * Thin wrappers over SurveyExecutionDsl. Answers are written in features as a
 * comma-separated string (e.g. "5,5,5,5,5"); use the literal `null` for an
 * unanswered question (e.g. "1,2,null,4").
 */

function parseAnswers(csv: string): (number | null)[] {
  return csv.split(',').map((raw) => {
    const value = raw.trim();
    if (value === '' || value.toLowerCase() === 'null') return null;
    return Number(value);
  });
}

// --- Survey run lifecycle ---------------------------------------------------

Given(
  'a completed survey run {string} for team {string} led by {string} answered by {string} with {string}',
  async function (
    this: McRadarWorld,
    title: string,
    teamName: string,
    leadEmail: string,
    memberEmail: string,
    csv: string,
  ) {
    await this.dsl.completeSurveyRun({
      teamName,
      title,
      leadEmail,
      memberEmail,
      answers: parseAnswers(csv),
    });
  },
);

When(
  'I create a survey run for team {string}',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.createSurveyRun({ teamName });
  },
);

When(
  'I create a survey run {string} for team {string}',
  async function (this: McRadarWorld, title: string, teamName: string) {
    await this.dsl.surveyExecution.createSurveyRun({ teamName, title });
  },
);

When(
  'I open the survey run for team {string}',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.openSurveyRun({ teamName });
  },
);

When(
  'I open the survey run {string} for team {string}',
  async function (this: McRadarWorld, title: string, teamName: string) {
    await this.dsl.surveyExecution.openSurveyRun({ teamName, title });
  },
);

When(
  'I close the survey run for team {string}',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.closeSurveyRun({ teamName });
  },
);

When(
  'I close the survey run {string} for team {string}',
  async function (this: McRadarWorld, title: string, teamName: string) {
    await this.dsl.surveyExecution.closeSurveyRun({ teamName, title });
  },
);

When(
  'I reopen the survey run for team {string}',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.reopenSurveyRun({ teamName });
  },
);

// --- Navigation -------------------------------------------------------------

When(
  'I navigate to the survey run page for team {string}',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.openSurveyRunPage({ teamName });
  },
);

When(
  'I navigate to the survey run page {string} for team {string}',
  async function (this: McRadarWorld, title: string, teamName: string) {
    await this.dsl.surveyExecution.openSurveyRunPage({ teamName, title });
  },
);

When('I try to view the last survey run', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.attemptToViewLastSurveyRun();
});

// --- Answering --------------------------------------------------------------

When('I answer the survey', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.answerSurvey();
});

When('I answer the survey with {string}', async function (this: McRadarWorld, csv: string) {
  await this.dsl.surveyExecution.answerSurvey({ answers: parseAnswers(csv) });
});

When(
  'I add the comment {string} to capability {string}',
  async function (this: McRadarWorld, comment: string, capabilityName: string) {
    await this.dsl.surveyExecution.addCommentToQuestion({ capabilityName, comment });
  },
);

// --- Results & profile navigation ------------------------------------------

When(
  'I view the assessment results for team {string}',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.viewAssessmentResults({ teamName });
  },
);

When(
  'I view the capability profile for team {string}',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.viewCapabilityProfile({ teamName });
  },
);

When('I access the latest survey run results', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.accessLatestSurveyRunResults();
});

When('I try to view the capability profile', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.attemptToViewCapabilityProfile();
});

When(
  'I view the trend view for team {string}',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.viewTrendView({ teamName });
  },
);

When('I try to view the trend view', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.attemptToViewTrendView();
});

When(
  'I access the guidance for capability {string}',
  async function (this: McRadarWorld, capabilityName: string) {
    await this.dsl.surveyExecution.accessGuidanceForCapability({ capabilityName });
  },
);

When('I open the DORA capability info', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.openDoraCapabilityInfo();
});

// --- Assertions: survey run state ------------------------------------------

Then('the survey run status is {string}', async function (this: McRadarWorld, status: string) {
  await this.dsl.surveyExecution.confirmSurveyRunDetails({ status });
});

Then(
  'the survey run for team {string} accepts responses',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.confirmAcceptsSurveyResponse({ teamName });
  },
);

Then('the survey run {string} is listed for team {string}', async function (
  this: McRadarWorld,
  title: string,
  teamName: string,
) {
  await this.dsl.surveyExecution.confirmSurveyRunIsListed({ teamName, title });
});

Then('I see {int} survey run(s) in the history', async function (
  this: McRadarWorld,
  expectedCount: number,
) {
  await this.dsl.surveyExecution.confirmSurveyRunCount({ expectedCount });
});

Then('the survey run is closed', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmSurveyRunClosed();
});

Then('the survey is not yet open', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmSurveyNotYetOpen();
});

Then('no survey is available', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmNoSurveyAvailable();
});

Then('I cannot create a survey run', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmCreatingSurveyRunNotPossible();
});

Then('I cannot open the survey run', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmOpeningSurveyRunIsNotPossible();
});

Then('I cannot close the survey run', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmClosingSurveyRunIsNotPossible();
});

Then('I cannot reopen the survey run', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmReopeningSurveyRunIsNotPossible();
});

Then('I cannot answer the survey', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmCannotAnswerSurvey();
});

// --- Assertions: answers ----------------------------------------------------

Then(
  'my response is saved for team {string}',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.surveyExecution.confirmResponseSaved({ teamName });
  },
);

Then(
  'my response with answers {string} is saved for team {string}',
  async function (this: McRadarWorld, csv: string, teamName: string) {
    await this.dsl.surveyExecution.confirmResponseSaved({ teamName, answers: parseAnswers(csv) });
  },
);

Then('my answers are {string}', async function (this: McRadarWorld, csv: string) {
  await this.dsl.surveyExecution.confirmMyAnswers({ answers: parseAnswers(csv) });
});

Then('every question has a 5-point scale', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmAllQuestionsHave5PointScale();
});

Then('every question is answerable', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmAllQuestionsAreAnswerable();
});

// --- Assertions: comments ---------------------------------------------------

Then(
  'the comment for capability {string} is saved',
  async function (this: McRadarWorld, capabilityName: string) {
    await this.dsl.surveyExecution.confirmCommentSaved({ capabilityName });
  },
);

Then(
  'my comment for capability {string} is {string}',
  async function (this: McRadarWorld, capabilityName: string, comment: string) {
    await this.dsl.surveyExecution.confirmMyComment({ capabilityName, comment });
  },
);

Then('the comment {string} is not shown in the results', async function (
  this: McRadarWorld,
  comment: string,
) {
  await this.dsl.surveyExecution.confirmCommentNotInResults({ comment });
});

// --- Assertions: results & scores ------------------------------------------

Then('the assessment results are displayed', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmAssessmentResultsDisplayed();
});

Then('the capability scores are displayed', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmCapabilityScoresDisplayed();
});

Then('an overall summary is displayed', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmOverallSummaryDisplayed();
});

Then('individual responses are not visible', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmIndividualResponsesNotVisible();
});

Then(
  'the total response count is {int}',
  async function (this: McRadarWorld, expectedCount: number) {
    await this.dsl.surveyExecution.confirmTotalResponsesCount({ expectedCount });
  },
);

Then(
  'the aggregated score for capability {string} is {float}',
  async function (this: McRadarWorld, capabilityName: string, expectedScore: number) {
    await this.dsl.surveyExecution.confirmAggregatedScoreForCapability({
      capabilityName,
      expectedScore,
    });
  },
);

// --- Assertions: capability profile ----------------------------------------

Then('the capability profile visualization is displayed', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmCapabilityProfileVisualizationDisplayed();
});

Then('the maturity levels are identifiable', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmMaturityLevelsIdentifiable();
});

Then('I am denied access', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmAccessDenied();
});

// --- Assertions: trend view -------------------------------------------------

Then('the trend visualization is displayed', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmTrendVisualizationDisplayed();
});

Then('the trend cards cover {int} survey runs', async function (
  this: McRadarWorld,
  expectedSurveyCount: number,
) {
  await this.dsl.surveyExecution.confirmTrendCardsHaveSurveyCount({ expectedSurveyCount });
});

Then('the runs appear in chronological order {string}', async function (
  this: McRadarWorld,
  csv: string,
) {
  await this.dsl.surveyExecution.confirmRunsInChronologicalOrder({
    expectedTitlesInOrder: csv.split(',').map((title) => title.trim()),
  });
});

Then(
  'capability {string} improved from run {string} to run {string}',
  async function (
    this: McRadarWorld,
    doraCapabilityName: string,
    fromRunTitle: string,
    toRunTitle: string,
  ) {
    await this.dsl.surveyExecution.confirmDoraCapabilityImproved({
      doraCapabilityName,
      fromRunTitle,
      toRunTitle,
    });
  },
);

Then(
  'capability {string} declined from run {string} to run {string}',
  async function (
    this: McRadarWorld,
    doraCapabilityName: string,
    fromRunTitle: string,
    toRunTitle: string,
  ) {
    await this.dsl.surveyExecution.confirmDoraCapabilityDeclined({
      doraCapabilityName,
      fromRunTitle,
      toRunTitle,
    });
  },
);

Then(
  'capability {string} remained unchanged from run {string} to run {string}',
  async function (
    this: McRadarWorld,
    doraCapabilityName: string,
    fromRunTitle: string,
    toRunTitle: string,
  ) {
    await this.dsl.surveyExecution.confirmDoraCapabilityRemainedUnchanged({
      doraCapabilityName,
      fromRunTitle,
      toRunTitle,
    });
  },
);

// --- Assertions: improvement guidance --------------------------------------

Then(
  'the guidance for capability {string} is displayed',
  async function (this: McRadarWorld, capabilityName: string) {
    await this.dsl.surveyExecution.confirmGuidanceDisplayed({ capabilityName });
  },
);

Then('the guidance text is:', async function (this: McRadarWorld, text: string) {
  await this.dsl.surveyExecution.confirmGuidanceText({ text });
});

Then('the guidance contains actionable advice', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmGuidanceContainsActionableAdvice();
});

Then('the guidance shows its DORA source', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmGuidanceShowsDoraSource();
});

Then('the DORA capability description is visible', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmDoraCapabilityDescriptionVisible();
});

Then('the DORA capability link is visible', async function (this: McRadarWorld) {
  await this.dsl.surveyExecution.confirmDoraCapabilityDoraLinkVisible();
});
