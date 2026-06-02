import { Then, When } from '@cucumber/cucumber';
import { McRadarWorld } from '../support/world.ts';

/**
 * Step definitions for the Team Management bounded context.
 *
 * Thin wrappers over TeamManagementDsl — no logic here. Team names and emails
 * pass straight to the DSL, which namespaces them with the per-scenario token.
 */

// --- Arrangements / actions -------------------------------------------------

When('I create a team {string}', async function (this: McRadarWorld, name: string) {
  await this.dsl.teamManagement!.createTeam({ name });
});

When(
  'I create a team {string} described as {string}',
  async function (this: McRadarWorld, name: string, description: string) {
    await this.dsl.teamManagement!.createTeam({ name, description });
  },
);

When(
  'I add {string} to team {string}',
  async function (this: McRadarWorld, email: string, teamName: string) {
    await this.dsl.teamManagement!.addTeamMember({ teamName, email });
  },
);

When(
  'I remove {string} from team {string}',
  async function (this: McRadarWorld, email: string, teamName: string) {
    await this.dsl.teamManagement!.removeTeamMember({ teamName, email });
  },
);

When(
  'I promote {string} to team lead in team {string}',
  async function (this: McRadarWorld, email: string, teamName: string) {
    await this.dsl.teamManagement!.promoteMemberToTeamLead({ teamName, email });
  },
);

When(
  'I demote {string} to member in team {string}',
  async function (this: McRadarWorld, email: string, teamName: string) {
    await this.dsl.teamManagement!.demoteTeamLeadToMember({ teamName, email });
  },
);

When(
  'I rename team {string} to {string} described as {string}',
  async function (this: McRadarWorld, teamName: string, newName: string, newDescription: string) {
    await this.dsl.teamManagement!.editTeamDetails({ teamName, newName, newDescription });
  },
);

When('I open the home page', async function (this: McRadarWorld) {
  await this.dsl.teamManagement!.openHomePage();
});

When('I open the members of team {string}', async function (this: McRadarWorld, teamName: string) {
  await this.dsl.teamManagement!.openTeamMembers({ teamName });
});

When('I open the details of team {string}', async function (this: McRadarWorld, teamName: string) {
  await this.dsl.teamManagement!.openTeamDetails({ teamName });
});

When('I try to open the team details directly', async function (this: McRadarWorld) {
  await this.dsl.teamManagement!.attemptOpenTeamDetails();
});

// --- Assertions -------------------------------------------------------------

Then('team {string} is created', async function (this: McRadarWorld, name: string) {
  await this.dsl.teamManagement!.confirmTeamCreated({ name });
});

Then(
  '{string} is the team lead of team {string}',
  async function (this: McRadarWorld, email: string, teamName: string) {
    await this.dsl.teamManagement!.confirmTeamLead({ teamName, email });
  },
);

Then('I see team {string} in my team list', async function (this: McRadarWorld, teamName: string) {
  await this.dsl.teamManagement!.confirmTeamInList({ teamName });
});

Then(
  'I do not see team {string} in my team list',
  async function (this: McRadarWorld, teamName: string) {
    await this.dsl.teamManagement!.confirmTeamNotInList({ teamName });
  },
);

Then(
  'I see team {string} led by {string}',
  async function (this: McRadarWorld, teamName: string, teamLeadEmail: string) {
    await this.dsl.teamManagement!.confirmTeamDetails({ teamName, teamLeadEmail });
  },
);

Then(
  'I see team {string} described as {string} led by {string}',
  async function (
    this: McRadarWorld,
    teamName: string,
    description: string,
    teamLeadEmail: string,
  ) {
    await this.dsl.teamManagement!.confirmTeamDetails({ teamName, description, teamLeadEmail });
  },
);

Then(
  'I see team {string} led by {string} with {int} survey run(s)',
  async function (
    this: McRadarWorld,
    teamName: string,
    teamLeadEmail: string,
    numberOfSurveyRuns: number,
  ) {
    await this.dsl.teamManagement!.confirmTeamDetails({
      teamName,
      teamLeadEmail,
      numberOfSurveyRuns,
    });
  },
);

Then(
  'I see team {string} described as {string} led by {string} with {int} survey run(s)',
  async function (
    this: McRadarWorld,
    teamName: string,
    description: string,
    teamLeadEmail: string,
    numberOfSurveyRuns: number,
  ) {
    await this.dsl.teamManagement!.confirmTeamDetails({
      teamName,
      description,
      teamLeadEmail,
      numberOfSurveyRuns,
    });
  },
);

Then('{string} is listed as a team member', async function (this: McRadarWorld, email: string) {
  await this.dsl.teamManagement!.confirmTeamMemberInList({ email });
});

Then('{string} is listed as a team lead', async function (this: McRadarWorld, email: string) {
  await this.dsl.teamManagement!.confirmTeamLeadInList({ email });
});

Then('{string} is not listed as a team member', async function (this: McRadarWorld, email: string) {
  await this.dsl.teamManagement!.confirmTeamMemberNotInList({ email });
});

Then('I am denied access to the team details', async function (this: McRadarWorld) {
  await this.dsl.teamManagement!.confirmTeamAccessDenied();
});

Then('I cannot see the edit team button', async function (this: McRadarWorld) {
  await this.dsl.teamManagement!.confirmEditButtonNotVisible();
});

Then('I cannot see the add member button', async function (this: McRadarWorld) {
  await this.dsl.teamManagement!.confirmAddMemberButtonNotVisible();
});

Then('I cannot see the remove member button', async function (this: McRadarWorld) {
  await this.dsl.teamManagement!.confirmRemoveButtonNotVisible();
});

Then('I cannot see the change role button', async function (this: McRadarWorld) {
  await this.dsl.teamManagement!.confirmChangeRoleButtonNotVisible();
});

Then(
  'I see an add member error containing {string}',
  async function (this: McRadarWorld, message: string) {
    await this.dsl.teamManagement!.confirmAddMemberErrorMessage({ message });
  },
);

Then(
  'I see a remove member error containing {string}',
  async function (this: McRadarWorld, message: string) {
    await this.dsl.teamManagement!.confirmRemoveMemberErrorMessage({ message });
  },
);

Then(
  'I see a change role error containing {string}',
  async function (this: McRadarWorld, message: string) {
    await this.dsl.teamManagement!.confirmChangeRoleErrorMessage({ message });
  },
);
