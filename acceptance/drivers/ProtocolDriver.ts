import { assert, assertExists } from '@std/assert';
import { expect, Page } from 'playwright/test';

type QuestionWithDoraCapability = {
  questionText: string;
  doraCapabilityName: string;
  doraCapabilityDescription: string;
};

export class ProtocolDriver {
  private lastClosedSurveyRunUrl: string | null = null;
  private lastOpenedTeamUrl: string | null = null;
  private lastSurveyRunUrl: string | null = null;

  constructor(private readonly page: Page) {
  }

  // Identity and Access

  async openUserRegistrationPage() {
    const registerButton = this.page.getByRole('link', { name: 'Register' });
    await expect(registerButton).toBeVisible();
    await registerButton.click();
  }

  async registerUser(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.getByRole('button', { name: 'Register' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async confirmRegistrationConfirmationMessage() {
    const successMessage = this.page.getByText('Registration successful!').first();
    await expect(successMessage).toBeVisible();
  }

  async confirmDuplicateEmailErrorMessage() {
    const errorMessage = this.page.getByText('User already exists. Use another email.').first();
    await expect(errorMessage).toBeVisible();
  }

  async confirmInvalidPasswordErrorMessage() {
    const errorMessage = this.page.getByText('Password too short').first();
    await expect(errorMessage).toBeVisible();
  }

  async openLoginPage() {
    // TODO: Remove the check. If the user is already logged in, should've logged out first.
    const userMenu = this.page.getByTestId('user-menu');
    if (await userMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.signOut();
    }

    await this.page.getByRole('link', { name: 'Log in' }).click();
  }

  async loginUser(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.getByRole('button', { name: 'Log in' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async confirmSuccessfulSignIn(email: string) {
    const emailElement = this.page.getByText(email);
    await expect(emailElement).toBeVisible();
  }

  async confirmCanAccessProtectedFeatures() {
    await this.openAccountPage();
    const accountPageTitle = this.page.getByRole('heading', { name: 'Account Overview' });
    await expect(accountPageTitle).toBeVisible();
  }

  async confirmLoginFailedErrorMessage() {
    const errorMessage = this.page.getByText('Invalid email or password').first();
    await expect(errorMessage).toBeVisible();
  }

  async accessAccountPageDirectly() {
    await this.page.goto('/account');
  }

  async openAccountPage() {
    const userMenuButton = this.page.getByTestId('user-menu');
    await userMenuButton.click();
    await this.page.getByRole('link', { name: 'Account' }).click();
  }

  async confirmRedirectToLoginPage() {
    const loginPageTitle = this.page.getByRole('heading', { name: 'Log in' });
    await expect(loginPageTitle).toBeVisible();
  }

  async navigateThroughApplication() {
    await this.openHomePage();
    await this.openAccountPage();
    await this.openHomePage();
  }

  async signOut() {
    const userMenuButton = this.page.getByTestId('user-menu');
    await userMenuButton.click();

    const logoutButton = this.page.getByRole('button', { name: 'Sign out' });
    await logoutButton.click();

    await this.page.waitForEvent('load');
  }

  async confirmRedirectToHomePage() {
    const headerElement = this.page.getByRole('heading', { name: 'Home' });
    await expect(headerElement).toBeVisible();
  }

  // Team Management

  async createTeam(name: string, description: string) {
    await this.openHomePage();
    await this.page.getByRole('link', { name: 'Add a team' }).click();
    await this.page.fill('input[name="name"]', name);
    await this.page.fill('textarea[name="description"]', description);
    await this.page.getByRole('button', { name: 'Create team' }).click();
  }

  async confirmTeamCreated(teamName: string) {
    await this.openHomePage();
    const teamLink = this.page.getByTestId(teamName);
    await expect(teamLink).toBeVisible();
  }

  async confirmTeamLead(teamName: string, email: string) {
    await this.openTeamMembers(teamName);
    await this.confirmTeamLeadInList(email);
  }

  async addTeamMember(teamName: string, email: string) {
    await this.openTeamMembers(teamName);
    const addTeamMemberForm = this.page.getByRole('form', { name: 'Add Team Member Form' });
    await expect(addTeamMemberForm).toBeVisible();
    await addTeamMemberForm.locator('input[name="teamMemberEmail"]').fill(email);
    await addTeamMemberForm.getByRole('button', { name: 'Add' }).click();
  }

  async openHomePage() {
    await this.navigateTo('/');
  }

  async openTeamMembers(teamName: string) {
    await this.openTeamDetails(teamName);
    const dropdownButton = this.page.getByTestId('team-options-button');
    await dropdownButton.click();
    const manageMembersLink = this.page.getByRole('link', { name: 'Manage members' });
    const viewMembersLink = this.page.getByRole('link', { name: 'View members' });
    const membersLink = manageMembersLink.or(viewMembersLink);
    await expect(membersLink).toBeVisible();
    await membersLink.click();
  }

  async confirmTeamInList(teamName: string) {
    const teamLink = this.page.getByRole('link', { name: teamName });
    await expect(teamLink).toBeVisible();
  }

  async openTeamDetails(teamName: string) {
    await this.openHomePage();
    const teamLink = this.page.getByTestId(teamName);
    await expect(teamLink).toBeVisible();
    await teamLink.click();
    this.lastOpenedTeamUrl = this.page.url();
  }

  async confirmTeamDetails(
    teamName: string,
    description: string,
    numberOfSurveyRuns: number,
  ) {
    const teamNameElement = this.page.getByRole('heading', { name: teamName, level: 1 });
    await expect(teamNameElement).toBeVisible();

    if (description) {
      const descriptionElement = this.page.getByText(description);
      await expect(descriptionElement).toBeVisible();
    }

    const surveyRunElements = await this.page.getByTestId('survey-run-link').count();
    expect(surveyRunElements).toBe(numberOfSurveyRuns);
  }

  async confirmTeamMemberInList(email: string) {
    const memberElement = this.page.getByText(`Regular Member: ${email}`);
    await expect(memberElement).toBeVisible();
  }

  async confirmTeamLeadInList(email: string) {
    const teamLeadElement = this.page.getByText(`Team Lead: ${email}`);
    await expect(teamLeadElement).toBeVisible();
  }

  async openTeamDetailsDirectly() {
    if (!this.lastOpenedTeamUrl) {
      throw new Error(
        'No team URL has been stored. Make sure openTeamDetails was called first.',
      );
    }
    await this.page.goto(this.lastOpenedTeamUrl);
  }

  async confirmTeamDetailsAccessDenied() {
    const accessDeniedMessage = this.page.getByText('Access Denied');
    await expect(accessDeniedMessage).toBeVisible();
  }

  async confirmEditButtonNotVisible() {
    const editLink = this.page.getByRole('link', { name: 'Edit team details' });
    await expect(editLink).not.toBeVisible();
  }

  async openEditTeamPage(teamName: string) {
    await this.openTeamDetails(teamName);
    const dropdownButton = this.page.getByTestId('team-options-button');
    await dropdownButton.click();
    const editLink = this.page.getByRole('link', { name: 'Edit team details' });
    await expect(editLink).toBeVisible();
    await editLink.click();
  }

  async editTeamDetails(newName: string, newDescription: string) {
    await this.page.fill('input[name="name"]', newName);
    await this.page.fill('textarea[name="description"]', newDescription);
    await this.page.getByRole('button', { name: 'Save Changes' }).click();
  }

  async confirmAddMemberFormNotVisible() {
    const addTeamMemberForm = this.page.getByRole('form', { name: 'Add Team Member Form' });
    await expect(addTeamMemberForm).not.toBeVisible();
  }

  async confirmAddMemberErrorMessage(expectedMessage: string) {
    const errorMessage = this.page.getByText(expectedMessage);
    await expect(errorMessage).toBeVisible();
  }

  async removeTeamMember(teamName: string, email: string) {
    await this.openTeamMembers(teamName);
    const removeButton = this.page.locator(`[data-testid="remove-member-${email}"]`);
    await expect(removeButton).toBeVisible();
    await removeButton.click();
  }

  async confirmTeamMemberNotInList(email: string) {
    const memberElement = this.page.getByText(`Regular Member: ${email}`);
    await expect(memberElement).not.toBeVisible();
  }

  async confirmTeamNotInList(teamName: string) {
    const teamLink = this.page.getByRole('link', { name: teamName });
    await expect(teamLink).not.toBeVisible();
  }

  async confirmRemoveButtonNotVisible() {
    const removeButtons = this.page.locator('[data-testid^="remove-member-"]');
    await expect(removeButtons).toHaveCount(0);
  }

  async confirmRemoveMemberErrorMessage(expectedMessage: string) {
    const errorMessage = this.page.getByText(expectedMessage);
    await expect(errorMessage).toBeVisible();
  }

  async promoteMemberToTeamLead(teamName: string, email: string) {
    await this.openTeamMembers(teamName);
    const promoteButton = this.page.locator(`[data-testid="promote-member-${email}"]`);
    await expect(promoteButton).toBeVisible();
    await promoteButton.click();
  }

  async demoteTeamLeadToMember(teamName: string, email: string) {
    await this.openTeamMembers(teamName);
    const demoteButton = this.page.locator(`[data-testid="demote-member-${email}"]`);
    await expect(demoteButton).toBeVisible();
    await demoteButton.click();
  }

  async confirmChangeRoleErrorMessage(expectedMessage: string) {
    const errorMessage = this.page.getByText(expectedMessage);
    await expect(errorMessage).toBeVisible();
  }

  async confirmChangeRoleButtonNotVisible() {
    const promoteButtons = this.page.locator('[data-testid^="promote-member-"]');
    const demoteButtons = this.page.locator('[data-testid^="demote-member-"]');
    await expect(promoteButtons).toHaveCount(0);
    await expect(demoteButtons).toHaveCount(0);
  }

  // Survey Definition

  async openSurveyModel(version: string): Promise<void> {
    await this.navigateTo(`/survey-models`);
    await expect(this.page.getByRole('heading', { name: `Survey Models` })).toBeVisible();

    const surveyModelLinkElement = this.page.getByRole('link', { name: `Version ${version}` });
    await expect(surveyModelLinkElement).toBeVisible();
    await surveyModelLinkElement.click();
  }

  async parseSurveyQuestions() {
    const questionItems = await this.page.getByTestId('survey-question-item').all();

    const questions: QuestionWithDoraCapability[] = [];

    for (const questionItem of questionItems) {
      const questionText = (await questionItem.getByTestId('survey-question-text').innerText())
        .trim();
      const doraCapabilityName = (await questionItem.getByTestId('survey-question-capability-name')
        .innerText()).trim();
      const doraCapabilityDescription = (await questionItem.getByTestId(
        'survey-question-capability-description',
      ).innerText()).trim();

      questions.push({
        questionText,
        doraCapabilityName,
        doraCapabilityDescription,
      });
    }

    return questions;
  }

  async confirmQuestionsMapToDoraCapabilities(
    questions: QuestionWithDoraCapability[],
  ): Promise<void> {
    await this.navigateTo('/dora-capabilities');
    for (const question of questions) {
      const capabilityContainerElements = this.page.getByTestId('dora-capability-item');
      const capabilityElement = capabilityContainerElements.filter({
        has: this.page.getByRole('heading', {
          level: 3,
          name: question.doraCapabilityName,
          exact: true,
        }),
      });

      await expect(capabilityElement).toBeVisible();
    }
  }

  async confirmQuestionIndicatesDoraCapability(
    questions: QuestionWithDoraCapability[],
  ): Promise<void> {
    await this.navigateTo('/dora-capabilities');
    for (const question of questions) {
      const doraCapabilityElement = this.page.getByTestId('dora-capability-description').filter({
        hasText: question.doraCapabilityDescription,
      });
      await expect(doraCapabilityElement).toBeVisible();
    }
  }

  async confirmAllDoraCapabilitiesAreCovered(doraCapabilities: string[]): Promise<void> {
    await this.navigateTo('/dora-capabilities');
    const existingDoraCapabilities = await this.page.getByTestId('dora-capability-name')
      .allTextContents();
    for (const doraCapability of existingDoraCapabilities) {
      expect(doraCapabilities).toContain(doraCapability.trim());
    }
  }

  // Survey Execution

  async createSurveyRun(teamName: string, title: string) {
    await this.openTeamDetails(teamName);
    await expect(this.page.getByRole('link', { name: 'New Survey' })).toBeVisible();
    await this.page.getByRole('link', { name: 'New Survey' }).click();
    await expect(this.page.getByRole('heading', { name: 'new Survey' })).toBeVisible();

    await this.page.getByLabel('Title').fill(title);

    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async confirmCreatingSurveyRunNotPossible() {
    await expect(this.page.getByRole('link', { name: 'new Survey' })).not.toBeVisible();
  }

  async confirmSurveyRunIsListed(teamName: string, title: string) {
    await this.openTeamDetails(teamName);
    const surveyRunLinkElement = this.page.getByRole('link', { name: title });
    await expect(surveyRunLinkElement).toBeVisible();
  }

  async openSurveyRunPage(teamName: string, title: string) {
    await this.openTeamDetails(teamName);
    const surveyRunLinkElement = this.page.getByRole('link', { name: title });
    await expect(surveyRunLinkElement).toBeVisible();
    await surveyRunLinkElement.click();
    this.lastSurveyRunUrl = this.page.url();
  }

  async confirmSurveyRunCount(expectedCount: number) {
    const surveyRunLinks = this.page.getByTestId('survey-run-link');
    const count = await surveyRunLinks.count();
    expect(count).toBe(expectedCount);
  }

  async confirmSurveyRunDetails(status: string) {
    const statusElement = this.page.getByTestId('survey-run-status');
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toHaveText(status);
  }

  async openSurveyRun(teamName: string, title: string) {
    await this.openSurveyRunPage(teamName, title);
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
    await this.page.getByRole('button', { name: 'Open' }).click();
  }

  async confirmAcceptsSurveyResponse() {
    const questionCards = this.page.getByTestId('question-card');
    await expect(questionCards.first()).toBeVisible();
    const button = questionCards.first().getByRole('button', { name: '1', exact: true });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  }

  async confirmOpeningSurveyRunIsNotPossible() {
    await expect(this.page.getByRole('button', { name: 'Open' })).not.toBeVisible();
  }

  async answerSurvey(answers: (number | null)[]) {
    const questionCards = this.page.getByTestId('question-card');
    for (const [index, answer] of answers.entries()) {
      if (answer !== null) {
        const button = questionCards.nth(index).getByTestId(`answer-button-${answer}`);
        const isPressed = await button.getAttribute('aria-pressed') === 'true';
        if (!isPressed) {
          await button.click();
          await expect(button).toHaveAttribute('aria-pressed', 'true');
          await expect(button).toBeEnabled({ timeout: 5000 });
        }
      }
    }
  }

  async confirmResponseSaved(teamName: string, surveyTitle: string, answers: (number | null)[]) {
    await this.openSurveyRunPage(teamName, surveyTitle);
    await expect(this.page.getByRole('heading', { name: surveyTitle })).toBeVisible();

    const questionCards = this.page.getByTestId('question-card');
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === null) {
        await expect(questionCards.nth(i).locator('button[aria-pressed="true"]')).toHaveCount(0);
      } else {
        const selectedButton = questionCards.nth(i).getByRole('button', {
          name: answers[i]!.toString(),
          exact: true,
        });
        await expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
      }
    }
  }

  async confirmAllQuestionsHave7PointScale() {
    const questionCards = await this.page.getByTestId('question-card').all();
    for (const card of questionCards) {
      for (let i = 1; i <= 7; i++) {
        await expect(card.getByRole('button', { name: i.toString(), exact: true })).toBeVisible();
      }
    }
  }

  async confirmAllQuestionsAreAnswerable() {
    const questionCards = await this.page.getByTestId('question-card').all();
    for (const card of questionCards) {
      const button5 = card.getByRole('button', { name: '5', exact: true });
      await button5.click();
      await expect(button5).toHaveAttribute('aria-pressed', 'true');
      await expect(button5).toBeEnabled({ timeout: 5000 });
    }
  }

  private async navigateTo(path: string) {
    const result = await this.page.goto(path);
    assertExists(result);
    assert(result.ok(), `Navigation to path ${path} failed with status ${result.status()}`);
  }

  async confirmMyAnswers(answers: (number | null)[]) {
    const questionCards = this.page.getByTestId('question-card');
    for (let index = 0; index < answers.length; index++) {
      const answer = answers[index];
      if (answer !== null) {
        const selectedButton = questionCards.nth(index).getByRole('button', {
          name: answer.toString(),
          exact: true,
        });
        await expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
      } else {
        const pressedButtons = questionCards.nth(index).locator('button[aria-pressed="true"]');
        await expect(pressedButtons).toHaveCount(0);
      }
    }
  }

  async confirmClosingSurveyRunIsNotPossible() {
    const closeButton = this.page.getByRole('button', { name: 'Close' });
    await expect(closeButton).not.toBeVisible();
  }

  async navigateToLastSurveyRunPage() {
    if (!this.lastSurveyRunUrl) {
      throw new Error(
        'No survey run URL has been stored. Make sure openSurveyRunDetails was called first.',
      );
    }
    await this.page.goto(this.lastSurveyRunUrl);
  }

  async confirmSurveyNotYetOpen() {
    const statusBadge = this.page.getByTestId('survey-run-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toHaveText('pending');
  }

  async confirmNoSurveyAvailable() {
    const heading = this.page.getByRole('heading', { name: 'No Surveys yet' });
    await expect(heading).toBeVisible();
    const message = this.page.getByText('Create your first survey to get started');
    await expect(message).toBeVisible();
  }

  async confirmCannotAnswerSurvey() {
    const questionCards = await this.page.getByTestId('question-card').all();
    if (questionCards.length === 0) {
      return;
    }

    for (const card of questionCards) {
      for (let i = 1; i <= 7; i++) {
        const button = card.getByRole('button', { name: i.toString(), exact: true });
        const isVisible = await button.isVisible();
        if (isVisible) {
          await expect(button).toBeDisabled();
        }
      }
    }
  }

  async confirmSurveyRunClosed() {
    const statusBadge = this.page.getByTestId('survey-run-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toHaveText('closed');
  }

  // Assessment Results

  async closeSurveyRun(teamName: string, title: string) {
    await this.openSurveyRunPage(teamName, title);
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
    await this.page.getByRole('button', { name: 'Close' }).click();

    this.lastClosedSurveyRunUrl = this.page.url();
  }

  async reopenSurveyRun(teamName: string, title: string) {
    await this.openSurveyRunPage(teamName, title);
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
    await this.page.getByRole('button', { name: 'Reopen' }).click();
  }

  async confirmReopeningSurveyRunIsNotPossible() {
    const reopenButton = this.page.getByRole('button', { name: 'Reopen' });
    await expect(reopenButton).not.toBeVisible();
  }

  async confirmAssessmentResultsDisplayed() {
    const resultsSection = this.page.getByTestId('assessment-results-section');
    await expect(resultsSection).toBeVisible();
  }

  async confirmCapabilityScoresDisplayed() {
    const scoresGrid = this.page.getByTestId('capability-scores-grid');
    await expect(scoresGrid).toBeVisible();

    const scoreCards = this.page.getByTestId('capability-score-card');
    const count = await scoreCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify each card has a capability name and score
    for (let i = 0; i < count; i++) {
      const card = scoreCards.nth(i);
      await expect(card.getByTestId('capability-name')).toBeVisible();
      await expect(card.getByTestId('capability-score')).toBeVisible();
    }
  }

  async confirmOverallSummaryDisplayed() {
    const overallSummary = this.page.getByTestId('overall-summary');
    await expect(overallSummary).toBeVisible();

    await expect(this.page.getByTestId('overall-score')).toBeVisible();
    await expect(this.page.getByTestId('total-responses')).toBeVisible();
  }

  async confirmIndividualResponsesNotVisible() {
    const pageContent = await this.page.content();

    expect(pageContent).not.toContain('respondentId');

    const resultsSection = this.page.getByTestId('assessment-results-section');
    const resultsSectionContent = await resultsSection.innerHTML();
    expect(resultsSectionContent).not.toContain('answerValue');
  }

  async confirmAggregatedScoreForCapability(capabilityName: string, expectedScore: number) {
    const scoreCard = this.page.locator('[data-testid="capability-score-card"]', {
      has: this.page.locator('[data-testid="capability-name"]', { hasText: capabilityName }),
    });
    await expect(scoreCard).toBeVisible();

    const scoreElement = scoreCard.getByTestId('capability-score');
    const scoreText = await scoreElement.innerText();
    const score = Number.parseFloat(scoreText);
    expect(score).toBeCloseTo(expectedScore, 1);
  }

  async confirmTotalResponsesCount(expectedCount: number) {
    const totalResponsesElement = this.page.getByTestId('total-responses');
    const responseText = await totalResponsesElement.innerText();
    const count = Number.parseInt(responseText);
    expect(count).toBe(expectedCount);
  }

  // Capability Profile

  async confirmCapabilityProfileVisualizationDisplayed() {
    const scoreCards = this.page.getByTestId('capability-score-card');
    const count = await scoreCards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const progressBar = scoreCards.nth(i).locator('.dora-capability-progress-bar');
      await expect(progressBar).toBeVisible();
    }
  }

  async confirmMaturityLevelsIdentifiable() {
    const scoreCards = this.page.getByTestId('capability-score-card');
    const count = await scoreCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const scoreCard = scoreCards.nth(i);
      const bucketElements = scoreCard.getByTestId(/^score-bucket-\d+$/);
      await expect(bucketElements).toHaveCount(1);
    }
  }

  async accessLatestSurveyRunResults() {
    // Click on the first (latest) survey run link from the team page
    const surveyRunLink = this.page.getByTestId('survey-run-link').first();
    await expect(surveyRunLink).toBeVisible();
    await surveyRunLink.click();
  }

  async attemptToViewCapabilityProfile() {
    // Try to navigate directly to the survey run details page using the stored URL
    // This is needed because non-members can't navigate through the team list
    if (!this.lastClosedSurveyRunUrl) {
      throw new Error(
        'No survey run URL has been stored. Make sure openSurveyRunDetails was called first.',
      );
    }
    await this.page.goto(this.lastClosedSurveyRunUrl);
  }

  async confirmAccessDenied() {
    const accessDeniedMessage = this.page.getByText('Access Denied');
    await expect(accessDeniedMessage).toBeVisible();
  }

  // Improvement Guidance

  async accessGuidanceForCapability(capabilityName: string) {
    const scoreCard = this.page.locator('[data-testid="capability-score-card"]', {
      has: this.page.locator('[data-testid="capability-name"]', { hasText: capabilityName }),
    });
    await expect(scoreCard).toBeVisible();
    await scoreCard.click();
    await expect(this.page.getByTestId('guidance-page')).toBeVisible();
  }

  async confirmGuidanceDisplayed(capabilityName: string) {
    const guidancePage = this.page.getByTestId('guidance-page');
    await expect(guidancePage).toBeVisible();
    await expect(this.page.getByTestId('guidance-capability-name')).toHaveText(
      capabilityName,
    );
    const guidanceSection = this.page.getByTestId('guidance-section');
    await expect(guidanceSection).toBeVisible();

    const guidanceText = this.page.getByTestId('guidance-text');
    await expect(guidanceText).toBeVisible();
    const text = await guidanceText.innerText();
    expect(text.length).toBeGreaterThan(0);
  }

  async confirmGuidanceText(expectedText: string) {
    const guidanceText = this.page.getByTestId('guidance-text');
    await expect(guidanceText).toBeVisible();
    await expect(guidanceText).toHaveText(expectedText);
  }

  async confirmGuidanceContainsActionableAdvice() {
    const guidanceText = this.page.getByTestId('guidance-text');
    await expect(guidanceText).toBeVisible();

    const text = await guidanceText.innerText();
    expect(text.length).toBeGreaterThan(20);
  }

  async confirmGuidanceShowsDoraSource() {
    const doraSourceLink = this.page.getByTestId('guidance-dora-source');
    await expect(doraSourceLink).toBeVisible();
    await expect(doraSourceLink).toHaveAttribute('href', /https:\/\/dora\.dev\/capabilities\//);
  }
}
