import { ProtocolDriver } from '../drivers/ProtocolDriver.ts';
import { namespaceEmail, namespaceName } from './testNamespace.ts';

export type CreateTeamParams = {
  name?: string;
  description?: string;
};

export type ConfirmTeamCreatedParams = {
  name?: string;
};

export type ConfirmTeamLeadParams = {
  teamName?: string;
  email: string;
};

export type AddTeamMemberParams = {
  teamName?: string;
  email: string;
};

export type OpenTeamMembersParams = {
  teamName?: string;
};

export type ConfirmTeamInListParams = {
  teamName?: string;
};

export type OpenTeamDetailsParams = {
  teamName?: string;
};

export type ConfirmTeamDetailsParams = {
  teamName?: string;
  description?: string;
  teamLeadEmail: string;
  numberOfSurveyRuns?: number;
};

export type ConfirmTeamMemberInListParams = {
  email: string;
};

export type ConfirmTeamLeadInListParams = {
  email: string;
};

export type EditTeamDetailsParams = {
  teamName?: string;
  newName: string;
  newDescription: string;
};

export type ConfirmAddMemberErrorMessageParams = {
  message: string;
};

export type RemoveTeamMemberParams = {
  teamName?: string;
  email: string;
};

export type ConfirmTeamNotInListParams = {
  teamName?: string;
};

export type ConfirmRemoveMemberErrorMessageParams = {
  message: string;
};

export type PromoteMemberToTeamLeadParams = {
  teamName?: string;
  email: string;
};

export type DemoteTeamLeadToMemberParams = {
  teamName?: string;
  email: string;
};

export type ConfirmChangeRoleErrorMessageParams = {
  message: string;
};

const DEFAULT_DUMMY_TEAM_NAME = 'Road Runners';
const DEFAULT_DUMMY_TEAM_DESCRIPTION = 'The best team in the world!';

export class TeamManagementDsl {
  constructor(
    private readonly driver: ProtocolDriver,
    private readonly token: string,
  ) {
  }

  private name(name: string): string {
    return namespaceName(name, this.token);
  }

  private email(email: string): string {
    return namespaceEmail(email, this.token);
  }

  async createTeam(params?: CreateTeamParams) {
    const name = this.name(params?.name ?? DEFAULT_DUMMY_TEAM_NAME);
    const description = params?.description ?? DEFAULT_DUMMY_TEAM_DESCRIPTION;
    await this.driver.createTeam(name, description);
  }

  async confirmTeamCreated(params?: ConfirmTeamCreatedParams) {
    const teamName = this.name(params?.name ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.confirmTeamCreated(teamName);
  }

  async confirmTeamLead(params: ConfirmTeamLeadParams) {
    const teamName = this.name(params.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.confirmTeamLead(teamName, this.email(params.email));
  }

  async addTeamMember(params: AddTeamMemberParams) {
    const teamName = this.name(params.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.addTeamMember(teamName, this.email(params.email));
  }

  async openHomePage() {
    await this.driver.openHomePage();
  }

  async openTeamMembers(params?: OpenTeamMembersParams) {
    const teamName = this.name(params?.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.openTeamMembers(teamName);
  }

  async confirmTeamInList(params?: ConfirmTeamInListParams) {
    const teamName = this.name(params?.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.confirmTeamInList(teamName);
  }

  async openTeamDetails(params?: OpenTeamDetailsParams) {
    const teamName = this.name(params?.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.openTeamDetails(teamName);
  }

  async confirmTeamDetails(params: ConfirmTeamDetailsParams) {
    const teamName = this.name(params.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    const description = params.description ?? DEFAULT_DUMMY_TEAM_DESCRIPTION;
    const numberOfSurveyRuns = params.numberOfSurveyRuns ?? 0;
    await this.driver.confirmTeamDetails(teamName, description, numberOfSurveyRuns);
  }

  async confirmTeamMemberInList(params: ConfirmTeamMemberInListParams) {
    await this.driver.confirmTeamMemberInList(this.email(params.email));
  }

  async confirmTeamLeadInList(params: ConfirmTeamLeadInListParams) {
    await this.driver.confirmTeamLeadInList(this.email(params.email));
  }

  async attemptOpenTeamDetails() {
    await this.driver.openTeamDetailsDirectly();
  }

  async confirmTeamAccessDenied() {
    await this.driver.confirmTeamDetailsAccessDenied();
  }

  async editTeamDetails(params: EditTeamDetailsParams) {
    const teamName = this.name(params.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.openEditTeamPage(teamName);
    await this.driver.editTeamDetails(this.name(params.newName), params.newDescription);
  }

  async confirmEditButtonNotVisible() {
    await this.driver.confirmEditButtonNotVisible();
  }

  async confirmAddMemberButtonNotVisible() {
    await this.driver.confirmAddMemberButtonNotVisible();
  }

  async confirmAddMemberErrorMessage(params: ConfirmAddMemberErrorMessageParams) {
    await this.driver.confirmAddMemberErrorMessage(params.message);
  }

  async removeTeamMember(params: RemoveTeamMemberParams) {
    const teamName = this.name(params.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.removeTeamMember(teamName, this.email(params.email));
  }

  async confirmTeamMemberNotInList(params: ConfirmTeamMemberInListParams) {
    await this.driver.confirmTeamMemberNotInList(this.email(params.email));
  }

  async confirmTeamNotInList(params?: ConfirmTeamNotInListParams) {
    const teamName = this.name(params?.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.confirmTeamNotInList(teamName);
  }

  async confirmRemoveButtonNotVisible() {
    await this.driver.confirmRemoveButtonNotVisible();
  }

  async confirmRemoveMemberErrorMessage(params: ConfirmRemoveMemberErrorMessageParams) {
    await this.driver.confirmRemoveMemberErrorMessage(params.message);
  }

  async promoteMemberToTeamLead(params: PromoteMemberToTeamLeadParams) {
    const teamName = this.name(params.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.promoteMemberToTeamLead(teamName, this.email(params.email));
  }

  async demoteTeamLeadToMember(params: DemoteTeamLeadToMemberParams) {
    const teamName = this.name(params.teamName ?? DEFAULT_DUMMY_TEAM_NAME);
    await this.driver.demoteTeamLeadToMember(teamName, this.email(params.email));
  }

  async confirmChangeRoleErrorMessage(params: ConfirmChangeRoleErrorMessageParams) {
    await this.driver.confirmChangeRoleErrorMessage(params.message);
  }

  async confirmChangeRoleButtonNotVisible() {
    await this.driver.confirmChangeRoleButtonNotVisible();
  }
}
