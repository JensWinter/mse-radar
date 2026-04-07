import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0005-001: Change Team Member Role', () => {
  const teamLeadEmail = 'pete@example.com';
  const secondTeamLeadEmail = 'sarah@example.com';
  const regularMemberEmail = 'murat@example.com';
  const teamName = 'Road Runners';
  const teamDescription = 'The best team in the world!';

  it('should allow a team lead to promote a member to team lead', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am a team lead with a regular member in my team
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: regularMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: regularMemberEmail });

    // WHEN I promote the team member to team lead
    await dsl.teamManagement.promoteMemberToTeamLead({ teamName, email: regularMemberEmail });

    // THEN they gain permissions to manage team members and survey runs (shown as team lead)
    await dsl.teamManagement.openTeamMembers({ teamName });
    await dsl.teamManagement.confirmTeamLeadInList({ email: regularMemberEmail });
  });

  it('should allow a team lead to demote another team lead to member', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am a team lead with another team lead in my team
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: secondTeamLeadEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: secondTeamLeadEmail });
    await dsl.teamManagement.promoteMemberToTeamLead({ teamName, email: secondTeamLeadEmail });

    // WHEN I change the team lead to a team member
    await dsl.teamManagement.demoteTeamLeadToMember({ teamName, email: secondTeamLeadEmail });

    // THEN they lose administrative permissions but can still participate in surveys (shown as regular member)
    await dsl.teamManagement.openTeamMembers({ teamName });
    await dsl.teamManagement.confirmTeamMemberInList({ email: secondTeamLeadEmail });
  });

  it('should show an error when trying to demote the last team lead', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am the only team lead of a team
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });

    // WHEN I try to demote myself (the last team lead)
    await dsl.teamManagement.demoteTeamLeadToMember({ teamName, email: teamLeadEmail });

    // THEN I see a clear message that there must be at least one team lead
    await dsl.teamManagement.confirmChangeRoleErrorMessage({
      message: 'Cannot demote the last team lead',
    });
  });

  it('should not allow a regular member to change team member roles (AC4)', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am not a team lead (I am a regular member)
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: regularMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: regularMemberEmail });

    // WHEN I sign in as a regular member and try to access role change functionality
    await dsl.identityAndAccess.signIn({ email: regularMemberEmail });
    await dsl.teamManagement.openTeamMembers({ teamName });

    // THEN I cannot change their role (role change buttons are not visible)
    await dsl.teamManagement.confirmChangeRoleButtonNotVisible();
  });
});
