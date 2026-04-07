import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0004-001: Add Team Member', () => {
  const teamLeadEmail = 'teamlead@example.com';
  const newMemberEmail = 'newmember@example.com';
  const regularMemberEmail = 'regularmember@example.com';
  const teamName = 'Road Runners';
  const teamDescription = 'The best team in the world!';

  it('should allow a team lead to add a team member', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am a team lead
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: newMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });

    // WHEN I add a registered user to my team
    await dsl.teamManagement.addTeamMember({ teamName, email: newMemberEmail });

    // THEN they become a team member
    await dsl.teamManagement.openTeamMembers({ teamName });
    await dsl.teamManagement.confirmTeamMemberInList({ email: newMemberEmail });
  });

  it('should allow a newly added team member to see the team in their list', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am a team lead and I added a user to the team
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: newMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: newMemberEmail });

    // WHEN they sign in
    await dsl.identityAndAccess.signIn({ email: newMemberEmail });

    // THEN they see the team in their list of teams
    await dsl.teamManagement.openHomePage();
    await dsl.teamManagement.confirmTeamInList({ teamName });
  });

  it('should not allow a regular member to add a team member', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am not a team lead (I am a regular member)
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: regularMemberEmail });
    await dsl.identityAndAccess.registerUser({ email: newMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: regularMemberEmail });

    // WHEN I try to add a member to a team (the add member form should not be visible)
    await dsl.identityAndAccess.signIn({ email: regularMemberEmail });
    await dsl.teamManagement.openTeamMembers({ teamName });

    // THEN I cannot add a member (add member form is not visible)
    await dsl.teamManagement.confirmAddMemberFormNotVisible();
  });

  it('should show an error when trying to add a non-registered user as a team member', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am a team lead and a user is already a team member
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: newMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: newMemberEmail });

    // WHEN I try to add the same user again
    await dsl.teamManagement.addTeamMember({ teamName, email: newMemberEmail });

    // THEN I see a clear message that the user is already on the team
    await dsl.teamManagement.confirmAddMemberErrorMessage({
      message: 'is already a member of this team',
    });
  });
});
