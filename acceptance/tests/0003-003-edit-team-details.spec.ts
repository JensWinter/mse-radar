import { describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0003-003: Edit Team Details', () => {
  const teamLeadEmail = 'pete@example.com';
  const teamMemberEmail = 'murat@example.com';
  const teamName = 'Road Runners';
  const teamDescription = 'The best team in the world!';

  it('should allow team lead to edit team name and description', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    const newTeamName = 'Speed Demons';
    const newDescription = 'Even faster than before!';

    // GIVEN I am a team lead
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });

    // WHEN I edit the team name and description
    await dsl.teamManagement.editTeamDetails({
      teamName,
      newName: newTeamName,
      newDescription,
    });

    // THEN the changes are saved and visible
    await dsl.teamManagement.confirmTeamDetails({
      teamName: newTeamName,
      description: newDescription,
      teamLeadEmail,
    });
  });

  it('should not allow non-team-lead members to see edit option', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    // GIVEN a team exists with a team lead and a regular member
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.registerUser({ email: teamMemberEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.addTeamMember({ teamName, email: teamMemberEmail });

    // WHEN the regular member views the team details
    await dsl.identityAndAccess.signIn({ email: teamMemberEmail });
    await dsl.teamManagement.openTeamDetails({ teamName });

    // THEN they cannot see the edit button
    await dsl.teamManagement.confirmEditButtonNotVisible();
  });

  it('should display updated information after editing', async () => {
    assertExists(dsl.identityAndAccess);
    assertExists(dsl.teamManagement);

    const newTeamName = 'Updated Team';
    const newDescription = 'Updated description';

    // GIVEN I am a team lead who has edited the team details
    await dsl.identityAndAccess.registerUser({ email: teamLeadEmail });
    await dsl.identityAndAccess.signIn({ email: teamLeadEmail });
    await dsl.teamManagement.createTeam({ name: teamName, description: teamDescription });
    await dsl.teamManagement.editTeamDetails({
      teamName,
      newName: newTeamName,
      newDescription,
    });

    // WHEN I view the team details afterward
    await dsl.teamManagement.openTeamDetails({ teamName: newTeamName });

    // THEN I see the updated information
    await dsl.teamManagement.confirmTeamDetails({
      teamName: newTeamName,
      description: newDescription,
      teamLeadEmail,
    });
  });
});
