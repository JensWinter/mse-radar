import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0004-002: Remove Team Member', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const regularMemberEmail = 'carol@example.com';
  const teamName = 'Road Runners';
  const teamDescription = 'The best team in the world!';

  it('should allow a team lead to remove a team member', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am a team lead with a team that has a member
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });

    // WHEN I remove the team member
    await dsl.teamManagement.removeTeamMember({ teamName, email: teamMemberEmail });

    // THEN they no longer appear in the team member list
    await dsl.teamManagement.openTeamMembers({ teamName });
    await dsl.teamManagement.confirmTeamMemberNotInList({ email: teamMemberEmail });
  });

  it("should not show the team in removed member's list when they sign in", async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN a member has been removed from a team
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });
    await dsl.teamManagement.removeTeamMember({ teamName, email: teamMemberEmail });

    // WHEN they sign in
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });

    // THEN the team no longer appears in their list of teams
    await dsl.teamManagement.openHomePage();
    await dsl.teamManagement.confirmTeamNotInList({ teamName });
  });

  it('should not allow a regular member to remove team members', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am not a team lead (I am a regular member)
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: regularMemberEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: regularMemberEmail });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });

    // WHEN I try to remove a member from a team (the remove buttons should not be visible)
    await dsl.identityAndAccess.signIn({ email: regularMemberEmail });
    await dsl.teamManagement.openTeamMembers({ teamName });

    // THEN I cannot remove them (remove buttons are not visible)
    await dsl.teamManagement.confirmRemoveButtonNotVisible();
  });

  it('should show an error when trying to remove the last team lead', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am the only team lead of a team
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });

    // WHEN I try to remove myself (the last team lead)
    await dsl.teamManagement.removeTeamMember({ teamName, email: teamLeadEmail });

    // THEN I see a clear message that there must be at least one team lead
    await dsl.teamManagement.confirmRemoveMemberErrorMessage({
      message: 'Cannot remove the last team lead',
    });
  });
});
