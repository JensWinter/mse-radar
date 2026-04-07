import { expect, suite, test, vi } from 'vitest';
import {
  TeamsService,
  TeamNameAlreadyExistsError,
  UserNotFoundError,
} from '@services/teams-service.ts';
import type { TeamsRepository } from '@database/teams-repository.ts';
import type { UsersRepository } from '@database/users-repository.ts';
import { User } from '@models/aggregates/user.ts';
import {
  Team,
  TeamMember,
  UserAlreadyTeamMemberError,
  MemberNotFoundError,
  CannotDemoteLastTeamLeadError,
} from '@models/aggregates/team.ts';
import {
  type IAuthorizationService,
  AuthorizationError,
} from '@services/authorization-service.ts';

suite('TeamsService', () => {
  suite('createTeam()', () => {
    test('creates a new team', async () => {
      // Arrange
      const currentUser = User.reconstitute('user-id', 'user@example.com');
      const mockTeamsRepository = {
        existsByName: vi.fn(),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as UsersRepository;
      const mockAuthorizationService = {
        currentUser,
      } as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const teamId = await teamsService.createTeam('team-name', 'description');

      // Assert
      expect(teamId).toBeDefined();
      expect(mockTeamsRepository.save).toHaveBeenCalledTimes(1);
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: teamId,
          name: 'team-name',
          description: 'description',
        }),
      );
    });

    test('adds the user as team-lead member', async () => {
      // Arrange
      const currentUser = User.reconstitute('user-id', 'user@example.com');
      const mockTeamsRepository = {
        existsByName: vi.fn(),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as UsersRepository;
      const mockAuthorizationService = {
        currentUser,
      } as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      await teamsService.createTeam('team-name', 'description');

      // Assert
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          members: expect.arrayContaining([
            expect.objectContaining({
              userId: 'user-id',
              userEmail: 'user@example.com',
              role: 'team-lead',
            }),
          ]),
        }),
      );
    });

    test('throws TeamNameAlreadyExistsError when team name already exists', async () => {
      // Arrange
      const mockTeamsRepository = {
        existsByName: vi.fn().mockResolvedValue(true),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as UsersRepository;
      const mockAuthorizationService = {} as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const createTeamPromise = teamsService.createTeam(
        'existing-team',
        'description',
      );

      // Assert
      await expect(createTeamPromise).rejects.toThrow(
        TeamNameAlreadyExistsError,
      );
    });

    test('creates a team with null description', async () => {
      // Arrange
      const currentUser = User.reconstitute('user-id', 'user@example.com');
      const mockTeamsRepository = {
        existsByName: vi.fn(),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as UsersRepository;
      const mockAuthorizationService = {
        currentUser,
      } as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const teamId = await teamsService.createTeam('team-name', null);

      // Assert
      expect(teamId).toBeDefined();
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: teamId,
          name: 'team-name',
          description: null,
        }),
      );
    });
  });

  suite('getTeam()', () => {
    test('returns team when team exists', async () => {
      // Arrange
      const teamMember = new TeamMember(
        'member-id',
        'team-id',
        'user-id',
        'user@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [teamMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamMember: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const result = await teamsService.getTeam('team-id');

      // Assert
      expect(mockTeamsRepository.getById).toHaveBeenCalledWith('team-id');
      expect(result).toEqual({
        id: 'team-id',
        name: 'team-name',
        description: 'team-description',
        members: [
          {
            userId: 'user-id',
            userEmail: 'user@example.com',
            role: 'team-lead',
          },
        ],
      });
    });

    test('throws Error when team does not exist', async () => {
      // Arrange
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {} as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const getTeamPromise = teamsService.getTeam('nonexistent-id');

      // Assert
      await expect(getTeamPromise).rejects.toThrow('Team not found');
      expect(mockTeamsRepository.getById).toHaveBeenCalledWith(
        'nonexistent-id',
      );
    });

    test('returns team with null description', async () => {
      // Arrange
      const teamMember = new TeamMember(
        'member-id',
        'team-id',
        'user-id',
        'user@example.com',
        'team-lead',
      );
      const team = Team.reconstitute('team-id', 'team-name', null, [
        teamMember,
      ]);
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamMember: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const result = await teamsService.getTeam('team-id');

      // Assert
      expect(result).toEqual({
        id: 'team-id',
        name: 'team-name',
        description: null,
        members: [
          {
            userId: 'user-id',
            userEmail: 'user@example.com',
            role: 'team-lead',
          },
        ],
      });
    });

    test('throws AuthorizationError when user is not a team member', async () => {
      // Arrange
      const teamMember = new TeamMember(
        'member-id',
        'team-id',
        'user-id',
        'user@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [teamMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamMember: vi
          .fn()
          .mockRejectedValue(
            new AuthorizationError('Access denied: not a team member'),
          ),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const getTeamPromise = teamsService.getTeam('team-id');

      // Assert
      await expect(getTeamPromise).rejects.toThrow(AuthorizationError);
      await expect(getTeamPromise).rejects.toThrow(
        'Access denied: not a team member',
      );
    });
  });

  suite('getAllTeams()', () => {
    test('returns array of teams when teams exist', async () => {
      // Arrange
      const userId = 'user-id-1';
      const teamMember1 = new TeamMember(
        'member-id-1',
        'team-id-1',
        'user-id-1',
        'user1@example.com',
        'team-lead',
      );
      const teamMember2 = new TeamMember(
        'member-id-2',
        'team-id-2',
        'user-id-2',
        'user2@example.com',
        'team-lead',
      );
      const team1 = Team.reconstitute(
        'team-id-1',
        'team-name-1',
        'team-description-1',
        [teamMember1],
      );
      const team2 = Team.reconstitute('team-id-2', 'team-name-2', null, [
        teamMember2,
      ]);
      const mockTeamsRepository = {
        getAllByMembership: vi.fn().mockResolvedValue([team1, team2]),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {} as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const result = await teamsService.getAllTeams(userId);

      // Assert
      expect(mockTeamsRepository.getAllByMembership).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual([
        {
          id: 'team-id-1',
          name: 'team-name-1',
          description: 'team-description-1',
          members: [
            {
              userId: 'user-id-1',
              userEmail: 'user1@example.com',
              role: 'team-lead',
            },
          ],
        },
        {
          id: 'team-id-2',
          name: 'team-name-2',
          description: null,
          members: [
            {
              userId: 'user-id-2',
              userEmail: 'user2@example.com',
              role: 'team-lead',
            },
          ],
        },
      ]);
    });

    test('returns empty array when no teams exist', async () => {
      // Arrange
      const userId = 'user-id-1';
      const mockTeamsRepository = {
        getAllByMembership: vi.fn().mockResolvedValue([]),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {} as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const result = await teamsService.getAllTeams(userId);

      // Assert
      expect(mockTeamsRepository.getAllByMembership).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual([]);
    });
  });

  suite('addMemberToTeam()', () => {
    test('adds a user as regular-member to an existing team', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [existingMember],
      );
      const newUser = User.reconstitute('new-user-id', 'newuser@example.com');
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {
        findByEmail: vi.fn().mockResolvedValue(newUser),
      } as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      await teamsService.addMemberToTeam('team-id', 'newuser@example.com');

      // Assert
      expect(mockTeamsRepository.getById).toHaveBeenCalledWith('team-id');
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        'newuser@example.com',
      );
      expect(mockTeamsRepository.save).toHaveBeenCalledTimes(1);
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          members: expect.arrayContaining([
            expect.objectContaining({
              userId: 'new-user-id',
              userEmail: 'newuser@example.com',
              role: 'regular-member',
            }),
          ]),
        }),
      );
    });

    test('throws Error when team is not found', async () => {
      // Arrange
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {} as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const addMemberPromise = teamsService.addMemberToTeam(
        'nonexistent-team-id',
        'user@example.com',
      );

      // Assert
      await expect(addMemberPromise).rejects.toThrow('Team not found');
    });

    test('throws UserNotFoundError when user is not found', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [existingMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {
        findByEmail: vi.fn().mockResolvedValue(null),
      } as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const addMemberPromise = teamsService.addMemberToTeam(
        'team-id',
        'nonexistent@example.com',
      );

      // Assert
      await expect(addMemberPromise).rejects.toThrow(UserNotFoundError);
      await expect(addMemberPromise).rejects.toThrow(
        'No registered user found with email: nonexistent@example.com',
      );
    });

    test('throws UserAlreadyTeamMemberError when user is already a team member', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'existing-user-id',
        'existing@example.com',
        'regular-member',
      );
      const teamLead = new TeamMember(
        'lead-member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [teamLead, existingMember],
      );
      const existingUser = User.reconstitute(
        'existing-user-id',
        'existing@example.com',
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {
        findByEmail: vi.fn().mockResolvedValue(existingUser),
      } as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const addMemberPromise = teamsService.addMemberToTeam(
        'team-id',
        'existing@example.com',
      );

      // Assert
      await expect(addMemberPromise).rejects.toThrow(
        UserAlreadyTeamMemberError,
      );
      await expect(addMemberPromise).rejects.toThrow(
        'User existing@example.com is already a member of this team',
      );
    });

    test('throws AuthorizationError when user is not a team lead', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [existingMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi
          .fn()
          .mockRejectedValue(
            new AuthorizationError('Access denied: team lead role required'),
          ),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const addMemberPromise = teamsService.addMemberToTeam(
        'team-id',
        'newuser@example.com',
      );

      // Assert
      await expect(addMemberPromise).rejects.toThrow(AuthorizationError);
      await expect(addMemberPromise).rejects.toThrow(
        'Access denied: team lead role required',
      );
    });
  });

  suite('updateTeam()', () => {
    test('team lead can update team name', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'original-name',
        'original-description',
        [existingMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        existsByName: vi.fn().mockResolvedValue(false),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      await teamsService.updateTeam(
        'team-id',
        'new-name',
        'original-description',
      );

      // Assert
      expect(mockTeamsRepository.getById).toHaveBeenCalledWith('team-id');
      expect(mockAuthorizationService.assertTeamLead).toHaveBeenCalledWith(
        team,
      );
      expect(mockTeamsRepository.existsByName).toHaveBeenCalledWith('new-name');
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'new-name',
          description: 'original-description',
        }),
      );
    });

    test('team lead can update team description', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'original-description',
        [existingMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        existsByName: vi.fn(),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      await teamsService.updateTeam('team-id', 'team-name', 'new-description');

      // Assert
      expect(mockTeamsRepository.existsByName).not.toHaveBeenCalled();
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'team-name',
          description: 'new-description',
        }),
      );
    });

    test('team lead can update both name and description', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'original-name',
        'original-description',
        [existingMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        existsByName: vi.fn().mockResolvedValue(false),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      await teamsService.updateTeam('team-id', 'new-name', 'new-description');

      // Assert
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'new-name',
          description: 'new-description',
        }),
      );
    });

    test('team lead can set description to null', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'original-description',
        [existingMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        existsByName: vi.fn(),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      await teamsService.updateTeam('team-id', 'team-name', null);

      // Assert
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'team-name',
          description: null,
        }),
      );
    });

    test('throws AuthorizationError when user is not a team lead', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [existingMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi
          .fn()
          .mockRejectedValue(
            new AuthorizationError('Access denied: team lead role required'),
          ),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const updateTeamPromise = teamsService.updateTeam(
        'team-id',
        'new-name',
        'new-description',
      );

      // Assert
      await expect(updateTeamPromise).rejects.toThrow(AuthorizationError);
      await expect(updateTeamPromise).rejects.toThrow(
        'Access denied: team lead role required',
      );
    });

    test('throws TeamNameAlreadyExistsError when new name already exists', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'original-name',
        'team-description',
        [existingMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        existsByName: vi.fn().mockResolvedValue(true),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const updateTeamPromise = teamsService.updateTeam(
        'team-id',
        'existing-name',
        'new-description',
      );

      // Assert
      await expect(updateTeamPromise).rejects.toThrow(
        TeamNameAlreadyExistsError,
      );
    });

    test('throws Error when team is not found', async () => {
      // Arrange
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {} as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const updateTeamPromise = teamsService.updateTeam(
        'nonexistent-id',
        'new-name',
        'new-description',
      );

      // Assert
      await expect(updateTeamPromise).rejects.toThrow('Team not found');
    });

    test('does not check name uniqueness when name is unchanged', async () => {
      // Arrange
      const existingMember = new TeamMember(
        'member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'same-name',
        'original-description',
        [existingMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        existsByName: vi.fn(),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      await teamsService.updateTeam('team-id', 'same-name', 'new-description');

      // Assert
      expect(mockTeamsRepository.existsByName).not.toHaveBeenCalled();
      expect(mockTeamsRepository.save).toHaveBeenCalled();
    });
  });

  suite('changeMemberRole()', () => {
    test('promotes a regular member to team lead', async () => {
      // Arrange
      const teamLead = new TeamMember(
        'lead-member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const regularMember = new TeamMember(
        'member-id',
        'team-id',
        'member-user-id',
        'member@example.com',
        'regular-member',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [teamLead, regularMember],
      );
      const memberUser = User.reconstitute(
        'member-user-id',
        'member@example.com',
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {
        findByEmail: vi.fn().mockResolvedValue(memberUser),
      } as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      await teamsService.changeMemberRole(
        'team-id',
        'member@example.com',
        'team-lead',
      );

      // Assert
      expect(mockTeamsRepository.getById).toHaveBeenCalledWith('team-id');
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        'member@example.com',
      );
      expect(mockAuthorizationService.assertTeamLead).toHaveBeenCalledWith(
        team,
      );
      expect(mockTeamsRepository.save).toHaveBeenCalledTimes(1);
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          members: expect.arrayContaining([
            expect.objectContaining({
              userId: 'member-user-id',
              userEmail: 'member@example.com',
              role: 'team-lead',
            }),
          ]),
        }),
      );
    });

    test('demotes a team lead to regular member when there are multiple team leads', async () => {
      // Arrange
      const teamLead1 = new TeamMember(
        'lead-member-id-1',
        'team-id',
        'lead-user-id-1',
        'lead1@example.com',
        'team-lead',
      );
      const teamLead2 = new TeamMember(
        'lead-member-id-2',
        'team-id',
        'lead-user-id-2',
        'lead2@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [teamLead1, teamLead2],
      );
      const leadUser2 = User.reconstitute(
        'lead-user-id-2',
        'lead2@example.com',
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
        save: vi.fn(),
      } as any as TeamsRepository;
      const mockUsersRepository = {
        findByEmail: vi.fn().mockResolvedValue(leadUser2),
      } as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      await teamsService.changeMemberRole(
        'team-id',
        'lead2@example.com',
        'regular-member',
      );

      // Assert
      expect(mockTeamsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          members: expect.arrayContaining([
            expect.objectContaining({
              userId: 'lead-user-id-2',
              userEmail: 'lead2@example.com',
              role: 'regular-member',
            }),
          ]),
        }),
      );
    });

    test('throws Error when team is not found', async () => {
      // Arrange
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {} as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const changeMemberRolePromise = teamsService.changeMemberRole(
        'nonexistent-team-id',
        'member@example.com',
        'team-lead',
      );

      // Assert
      await expect(changeMemberRolePromise).rejects.toThrow('Team not found');
    });

    test('throws UserNotFoundError when user is not found', async () => {
      // Arrange
      const teamLead = new TeamMember(
        'lead-member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [teamLead],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {
        findByEmail: vi.fn().mockResolvedValue(null),
      } as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const changeMemberRolePromise = teamsService.changeMemberRole(
        'team-id',
        'nonexistent@example.com',
        'team-lead',
      );

      // Assert
      await expect(changeMemberRolePromise).rejects.toThrow(UserNotFoundError);
      await expect(changeMemberRolePromise).rejects.toThrow(
        'No registered user found with email: nonexistent@example.com',
      );
    });

    test('throws MemberNotFoundError when user is not a member of the team', async () => {
      // Arrange
      const teamLead = new TeamMember(
        'lead-member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [teamLead],
      );
      const nonMemberUser = User.reconstitute(
        'non-member-user-id',
        'nonmember@example.com',
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {
        findByEmail: vi.fn().mockResolvedValue(nonMemberUser),
      } as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const changeMemberRolePromise = teamsService.changeMemberRole(
        'team-id',
        'nonmember@example.com',
        'team-lead',
      );

      // Assert
      await expect(changeMemberRolePromise).rejects.toThrow(
        MemberNotFoundError,
      );
      await expect(changeMemberRolePromise).rejects.toThrow(
        'Member with user ID non-member-user-id not found in this team',
      );
    });

    test('throws CannotDemoteLastTeamLeadError when trying to demote the last team lead', async () => {
      // Arrange
      const teamLead = new TeamMember(
        'lead-member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const regularMember = new TeamMember(
        'member-id',
        'team-id',
        'member-user-id',
        'member@example.com',
        'regular-member',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [teamLead, regularMember],
      );
      const leadUser = User.reconstitute('lead-user-id', 'lead@example.com');
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {
        findByEmail: vi.fn().mockResolvedValue(leadUser),
      } as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn(),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const changeMemberRolePromise = teamsService.changeMemberRole(
        'team-id',
        'lead@example.com',
        'regular-member',
      );

      // Assert
      await expect(changeMemberRolePromise).rejects.toThrow(
        CannotDemoteLastTeamLeadError,
      );
      await expect(changeMemberRolePromise).rejects.toThrow(
        'Cannot demote the last team lead',
      );
    });

    test('throws AuthorizationError when user is not a team lead', async () => {
      // Arrange
      const teamLead = new TeamMember(
        'lead-member-id',
        'team-id',
        'lead-user-id',
        'lead@example.com',
        'team-lead',
      );
      const regularMember = new TeamMember(
        'member-id',
        'team-id',
        'member-user-id',
        'member@example.com',
        'regular-member',
      );
      const team = Team.reconstitute(
        'team-id',
        'team-name',
        'team-description',
        [teamLead, regularMember],
      );
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockUsersRepository = {} as any as UsersRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi
          .fn()
          .mockRejectedValue(
            new AuthorizationError('Access denied: team lead role required'),
          ),
      } as any as IAuthorizationService;
      const teamsService = new TeamsService(
        mockAuthorizationService,
        mockTeamsRepository,
        mockUsersRepository,
      );

      // Act
      const changeMemberRolePromise = teamsService.changeMemberRole(
        'team-id',
        'member@example.com',
        'team-lead',
      );

      // Assert
      await expect(changeMemberRolePromise).rejects.toThrow(AuthorizationError);
      await expect(changeMemberRolePromise).rejects.toThrow(
        'Access denied: team lead role required',
      );
    });
  });
});
