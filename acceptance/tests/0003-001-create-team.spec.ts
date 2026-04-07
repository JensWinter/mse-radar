import { beforeEach, describe, it } from '@std/testing/bdd';
import { assertExists } from '@std/assert';
import { setupAcceptanceTest } from './testSetup.ts';

const dsl = setupAcceptanceTest();

describe('0003-001: Create team', () => {
  const currentUserEmail = 'laura@example.com';

  beforeEach(async () => {
    assertExists(dsl.identityAndAccess);

    await dsl.identityAndAccess.registerUser({ email: currentUserEmail });
    await dsl.identityAndAccess.signIn({ email: currentUserEmail });
  });

  it('should create a team with team lead', async () => {
    assertExists(dsl.teamManagement);

    // Given
    // Nothing to arrange (Login done in beforeEach)

    // When
    await dsl.teamManagement.createTeam();

    // Then
    await dsl.teamManagement.confirmTeamCreated();
    await dsl.teamManagement.confirmTeamLead({ email: currentUserEmail });
  });

  it("should show the new team in user's teams list", async () => {
    assertExists(dsl.teamManagement);

    // Given
    await dsl.teamManagement.createTeam();

    // When
    await dsl.teamManagement.openHomePage();

    // Then
    await dsl.teamManagement.confirmTeamInList();
  });

  it('should show details of the new team', async () => {
    assertExists(dsl.teamManagement);

    // Given
    await dsl.teamManagement.createTeam();

    // When
    await dsl.teamManagement.openTeamDetails();

    // Then
    await dsl.teamManagement.confirmTeamDetails({ teamLeadEmail: currentUserEmail });
  });
});
