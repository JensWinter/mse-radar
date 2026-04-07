import { expect, suite, test, vi } from 'vitest';
import { SurveyRunService } from '@services/survey-run-service.ts';
import type { SurveyRunRepository } from '@database/survey-run-repository.ts';
import type { TeamsRepository } from '@database/teams-repository.ts';
import { SurveyRun, SurveyRunResponse } from '@models/aggregates/survey-run.ts';
import { Team } from '@models/aggregates/team.ts';
import type { IAuthorizationService } from '@services/authorization-service.ts';
import { User } from '@models/aggregates/user.ts';

suite('SurveyRunService', () => {
  suite('createSurveyRun()', () => {
    test('creates a new survey run when team exists', async () => {
      // Arrange
      const team = Team.reconstitute('team-id', 'team-name', 'description', []);
      const mockSurveyRunRepository = {
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const surveyRunId = await service.createSurveyRun(
        'team-id',
        'survey-model-id',
        'Test Survey',
      );

      // Assert
      expect(surveyRunId).toBeDefined();
      expect(mockTeamsRepository.getById).toHaveBeenCalledWith('team-id');
      expect(mockSurveyRunRepository.save).toHaveBeenCalledTimes(1);
      expect(mockSurveyRunRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: surveyRunId,
          teamId: 'team-id',
          surveyModelId: 'survey-model-id',
        }),
      );
    });

    test('throws error when team does not exist', async () => {
      // Arrange
      const mockSurveyRunRepository = {
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as TeamsRepository;
      const mockAuthorizationService = {} as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const createPromise = service.createSurveyRun(
        'nonexistent-team-id',
        'survey-model-id',
        'Test Survey',
      );

      // Assert
      await expect(createPromise).rejects.toThrow('Team not found');
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });

    test('throws error when user is not team lead', async () => {
      // Arrange
      const team = Team.reconstitute('team-id', 'team-name', 'description', []);
      const mockSurveyRunRepository = {
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockAuthorizationService = {
        assertTeamLead: vi.fn().mockRejectedValue(new Error('Unauthorized')),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const createPromise = service.createSurveyRun(
        'team-id',
        'survey-model-id',
        'Test Survey',
      );

      // Assert
      await expect(createPromise).rejects.toThrow('Unauthorized');
      expect(mockAuthorizationService.assertTeamLead).toHaveBeenCalledWith(
        team,
      );
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });
  });

  suite('getSurveyRunsByTeam()', () => {
    test('returns survey runs for an existing team', async () => {
      // Arrange
      const team = Team.reconstitute('team-id', 'team-name', 'description', []);
      const surveyRun1 = SurveyRun.reconstitute(
        'survey-run-1',
        'team-id',
        'survey-model-1',
        'Test Survey',
        'open',
        [],
      );
      const surveyRun2 = SurveyRun.reconstitute(
        'survey-run-2',
        'team-id',
        'survey-model-2',
        'Test Survey',
        'pending',
        [],
      );
      const mockSurveyRunRepository = {
        getAllByTeamId: vi.fn().mockResolvedValue([surveyRun1, surveyRun2]),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockAuthorizationService = {
        assertTeamMember: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const result = await service.getSurveyRunsByTeam('team-id');

      // Assert
      expect(mockTeamsRepository.getById).toHaveBeenCalledWith('team-id');
      expect(mockSurveyRunRepository.getAllByTeamId).toHaveBeenCalledWith(
        'team-id',
      );
      expect(result[0].id).toEqual('survey-run-1');
      expect(result[0].teamId).toEqual('team-id');
      expect(result[0].surveyModelId).toEqual('survey-model-1');
      expect(result[0].title).toEqual('Test Survey');
      expect(result[0].status).toEqual('open');
      expect(result[0].responses).toEqual([]);
      expect(result[1].id).toEqual('survey-run-2');
      expect(result[1].teamId).toEqual('team-id');
      expect(result[1].surveyModelId).toEqual('survey-model-2');
      expect(result[1].title).toEqual('Test Survey');
      expect(result[1].status).toEqual('pending');
      expect(result[1].responses).toEqual([]);
    });

    test('returns empty array when team has no survey runs', async () => {
      // Arrange
      const team = Team.reconstitute('team-id', 'team-name', 'description', []);
      const mockSurveyRunRepository = {
        getAllByTeamId: vi.fn().mockResolvedValue([]),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockAuthorizationService = {
        assertTeamMember: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const result = await service.getSurveyRunsByTeam('team-id');

      // Assert
      expect(result).toEqual([]);
    });

    test('throws error when team does not exist', async () => {
      // Arrange
      const mockSurveyRunRepository = {
        getAllByTeamId: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as TeamsRepository;
      const mockAuthorizationService = {} as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const getPromise = service.getSurveyRunsByTeam('nonexistent-team-id');

      // Assert
      await expect(getPromise).rejects.toThrow('Team not found');
      expect(mockSurveyRunRepository.getAllByTeamId).not.toHaveBeenCalled();
    });

    test('throws error when user is not team member', async () => {
      // Arrange
      const team = Team.reconstitute('team-id', 'team-name', 'description', []);
      const mockSurveyRunRepository = {
        getAllByTeamId: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {
        getById: vi.fn().mockResolvedValue(team),
      } as any as TeamsRepository;
      const mockAuthorizationService = {
        assertTeamMember: vi.fn().mockRejectedValue(new Error('Unauthorized')),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const getPromise = service.getSurveyRunsByTeam('team-id');

      // Assert
      await expect(getPromise).rejects.toThrow('Unauthorized');
      expect(mockAuthorizationService.assertTeamMember).toHaveBeenCalledWith(
        team,
      );
      expect(mockSurveyRunRepository.getAllByTeamId).not.toHaveBeenCalled();
    });
  });

  suite('getSurveyRun()', () => {
    test('returns survey run when it exists', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanAccessSurveyRun: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const result = await service.getSurveyRun('survey-run-id');

      // Assert
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'survey-run-id',
      );
      expect(result.id).toEqual('survey-run-id');
      expect(result.teamId).toEqual('team-id');
      expect(result.surveyModelId).toEqual('survey-model-id');
      expect(result.title).toEqual('Test Survey');
      expect(result.status).toEqual('open');
      expect(result.responses).toEqual([]);
    });

    test('throws error when survey run does not exist', async () => {
      // Arrange
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {} as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const getPromise = service.getSurveyRun('nonexistent-id');

      // Assert
      await expect(getPromise).rejects.toThrow('Survey run not found');
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'nonexistent-id',
      );
    });

    test('throws error when user cannot access survey run', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanAccessSurveyRun: vi
          .fn()
          .mockRejectedValue(new Error('Unauthorized')),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const getPromise = service.getSurveyRun('survey-run-id');

      // Assert
      await expect(getPromise).rejects.toThrow('Unauthorized');
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'survey-run-id',
      );
      expect(
        mockAuthorizationService.assertCanAccessSurveyRun,
      ).toHaveBeenCalledWith(surveyRun);
    });
  });

  suite('openSurveyRun()', () => {
    test('opens a survey run when it exists', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'pending',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      await service.openSurveyRun('survey-run-id');

      // Assert
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'survey-run-id',
      );
      expect(surveyRun.status).toBe('open');
      expect(mockSurveyRunRepository.save).toHaveBeenCalledWith(surveyRun);
    });

    test('throws error when survey run does not exist', async () => {
      // Arrange
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const openPromise = service.openSurveyRun('nonexistent-id');

      // Assert
      await expect(openPromise).rejects.toThrow('Survey run not found');
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'nonexistent-id',
      );
      expect(
        mockAuthorizationService.assertCanManageSurveyRun,
      ).not.toHaveBeenCalled();
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });

    test('throws error when user cannot manage survey run', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'pending',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi
          .fn()
          .mockRejectedValue(new Error('Unauthorized')),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const openPromise = service.openSurveyRun('survey-run-id');

      // Assert
      await expect(openPromise).rejects.toThrow('Unauthorized');
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'survey-run-id',
      );
      expect(
        mockAuthorizationService.assertCanManageSurveyRun,
      ).toHaveBeenCalledWith(surveyRun);
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });
  });

  suite('closeSurveyRun()', () => {
    test('closes a survey run when it exists', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      await service.closeSurveyRun('survey-run-id');

      // Assert
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'survey-run-id',
      );
      expect(surveyRun.status).toBe('closed');
      expect(mockSurveyRunRepository.save).toHaveBeenCalledWith(surveyRun);
    });

    test('throws error when survey run does not exist', async () => {
      // Arrange
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const closePromise = service.closeSurveyRun('nonexistent-id');

      // Assert
      await expect(closePromise).rejects.toThrow('Survey run not found');
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'nonexistent-id',
      );
      expect(
        mockAuthorizationService.assertCanManageSurveyRun,
      ).not.toHaveBeenCalled();
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });

    test('throws error when user cannot manage survey run', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi
          .fn()
          .mockRejectedValue(new Error('Unauthorized')),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const closePromise = service.closeSurveyRun('survey-run-id');

      // Assert
      await expect(closePromise).rejects.toThrow('Unauthorized');
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'survey-run-id',
      );
      expect(
        mockAuthorizationService.assertCanManageSurveyRun,
      ).toHaveBeenCalledWith(surveyRun);
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });
  });

  suite('reopenSurveyRun()', () => {
    test('reopens a closed survey run when no other survey run is open', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'closed',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        getAllByTeamId: vi.fn().mockResolvedValue([surveyRun]),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      await service.reopenSurveyRun('survey-run-id');

      // Assert
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'survey-run-id',
      );
      expect(mockSurveyRunRepository.getAllByTeamId).toHaveBeenCalledWith(
        'team-id',
      );
      expect(surveyRun.status).toBe('open');
      expect(mockSurveyRunRepository.save).toHaveBeenCalledWith(surveyRun);
    });

    test('throws error when survey run does not exist', async () => {
      // Arrange
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const reopenPromise = service.reopenSurveyRun('nonexistent-id');

      // Assert
      await expect(reopenPromise).rejects.toThrow('Survey run not found');
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'nonexistent-id',
      );
      expect(
        mockAuthorizationService.assertCanManageSurveyRun,
      ).not.toHaveBeenCalled();
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });

    test('throws error when user cannot manage survey run', async () => {
      // Arrange
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'closed',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi
          .fn()
          .mockRejectedValue(new Error('Unauthorized')),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const reopenPromise = service.reopenSurveyRun('survey-run-id');

      // Assert
      await expect(reopenPromise).rejects.toThrow('Unauthorized');
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'survey-run-id',
      );
      expect(
        mockAuthorizationService.assertCanManageSurveyRun,
      ).toHaveBeenCalledWith(surveyRun);
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });

    test('throws error when another survey run is already open for the team', async () => {
      // Arrange
      const closedSurveyRun = SurveyRun.reconstitute(
        'closed-survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'closed',
        [],
      );
      const openSurveyRun = SurveyRun.reconstitute(
        'open-survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(closedSurveyRun),
        getAllByTeamId: vi
          .fn()
          .mockResolvedValue([closedSurveyRun, openSurveyRun]),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanManageSurveyRun: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      // Act
      const reopenPromise = service.reopenSurveyRun('closed-survey-run-id');

      // Assert
      await expect(reopenPromise).rejects.toThrow(
        'Cannot reopen survey run: another survey run is already open for this team',
      );
      expect(mockSurveyRunRepository.getById).toHaveBeenCalledWith(
        'closed-survey-run-id',
      );
      expect(mockSurveyRunRepository.getAllByTeamId).toHaveBeenCalledWith(
        'team-id',
      );
      expect(closedSurveyRun.status).toBe('closed'); // Status should not change
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });
  });

  suite('saveAnswer()', () => {
    test('saves answer when survey run exists and user is authorized', async () => {
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [],
      );
      const currentUser = User.reconstitute('user-id', 'user@example.com');
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        currentUser,
        assertCanSubmitSurveyResponse: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      await service.saveAnswer('survey-run-id', 2, 5);

      expect(mockSurveyRunRepository.save).toHaveBeenCalledWith(surveyRun);
      expect(surveyRun.responses).toHaveLength(1);
      expect(surveyRun.responses[0].answers[2].answerValue).toBe(5);
    });

    test('throws when survey run not found', async () => {
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {} as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      await expect(service.saveAnswer('nonexistent-id', 0, 5)).rejects.toThrow(
        'Survey run not found',
      );
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });

    test('throws when user unauthorized', async () => {
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanSubmitSurveyResponse: vi
          .fn()
          .mockRejectedValue(new Error('Unauthorized')),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      await expect(service.saveAnswer('survey-run-id', 0, 5)).rejects.toThrow(
        'Unauthorized',
      );
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });
  });

  suite('saveComment()', () => {
    test('saves comment when survey run exists and user is authorized', async () => {
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [],
      );
      const currentUser = User.reconstitute('user-id', 'user@example.com');
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        currentUser,
        assertCanSubmitSurveyResponse: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      await service.saveComment('survey-run-id', 3, 'Great!');

      expect(mockSurveyRunRepository.save).toHaveBeenCalledWith(surveyRun);
      expect(surveyRun.responses).toHaveLength(1);
      expect(surveyRun.responses[0].answers[3].comment).toBe('Great!');
    });

    test('clears comment when empty string is saved', async () => {
      const currentUser = User.reconstitute('user-id', 'user@example.com');
      const existingResponse = SurveyRunResponse.reconstitute(
        'response-id',
        currentUser.id,
        [{ answerValue: 5, comment: 'Initial comment' }],
      );
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [existingResponse],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        currentUser,
        assertCanSubmitSurveyResponse: vi.fn().mockResolvedValue(undefined),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      await service.saveComment('survey-run-id', 0, '');

      expect(mockSurveyRunRepository.save).toHaveBeenCalledWith(surveyRun);
      expect(surveyRun.responses[0].answers[0].comment).toBeNull();
    });

    test('throws when survey run not found', async () => {
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {} as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      await expect(
        service.saveComment('nonexistent-id', 0, 'comment'),
      ).rejects.toThrow('Survey run not found');
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });

    test('throws when user unauthorized', async () => {
      const surveyRun = SurveyRun.reconstitute(
        'survey-run-id',
        'team-id',
        'survey-model-id',
        'Test Survey',
        'open',
        [],
      );
      const mockSurveyRunRepository = {
        getById: vi.fn().mockResolvedValue(surveyRun),
        save: vi.fn(),
      } as any as SurveyRunRepository;
      const mockTeamsRepository = {} as any as TeamsRepository;
      const mockAuthorizationService = {
        assertCanSubmitSurveyResponse: vi
          .fn()
          .mockRejectedValue(new Error('Unauthorized')),
      } as any as IAuthorizationService;
      const service = new SurveyRunService(
        mockAuthorizationService,
        mockSurveyRunRepository,
        mockTeamsRepository,
      );

      await expect(
        service.saveComment('survey-run-id', 0, 'comment'),
      ).rejects.toThrow('Unauthorized');
      expect(mockSurveyRunRepository.save).not.toHaveBeenCalled();
    });
  });
});
