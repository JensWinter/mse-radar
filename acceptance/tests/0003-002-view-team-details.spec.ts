import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0003-002: View Team Details', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const nonMemberEmail = 'carol@example.com';
  const teamName = 'Road Runners';
  const teamDescription = 'The best team in the world!';

  it('should allow team member to view team details', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am a member of a team
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });

    // WHEN I view the team details
    await dsl.teamManagement.openTeamDetails({ teamName });

    // THEN I see the team name and description
    await dsl.teamManagement.confirmTeamDetails({
      teamName,
      description: teamDescription,
      teamLeadEmail,
    });
  });

  it('should display team lead and members in team details', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN I am a member of a team with a team lead and at least one regular member
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });

    // WHEN I view the team details
    await dsl.teamManagement.openTeamMembers({ teamName });

    // THEN I see the team lead and members listed
    await dsl.teamManagement.confirmTeamLeadInList({ email: teamLeadEmail });
    await dsl.teamManagement.confirmTeamMemberInList({ email: teamMemberEmail });
  });

  it('should deny access to non-members trying to view team details', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN a team exists that I am not a member of
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: nonMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });

    // Store the team URL by opening team details
    await dsl.teamManagement.openTeamDetails({ teamName });

    // WHEN I am not a member and try to view the team details
    await dsl.identityAndAccess.signIn({ email: nonMemberEmail });
    await dsl.teamManagement.attemptOpenTeamDetails();

    // THEN I am denied access
    await dsl.teamManagement.confirmTeamAccessDenied();
  });
});
