import { suite, test, expect, vi } from 'vitest';
import { GuidanceService } from './guidance-service.ts';
import type { DoraCapabilityRepository } from '@database/dora-capability-repository.ts';
import { DoraCapability } from '@models/aggregates/dora-capability.ts';

suite('GuidanceService', () => {
  suite('getGuidanceForCapability', () => {
    test('returns null when capability is not found', async () => {
      const mockRepository: DoraCapabilityRepository = {
        getAll: vi.fn(),
        getById: vi.fn().mockResolvedValue(null),
      };
      const service = new GuidanceService(mockRepository);

      const result = await service.getGuidanceForCapability('unknown-id', 5.0);

      expect(result).toBeNull();
    });

    test('returns tailored guidance for beginning tier at upper boundary', async () => {
      const capability = new DoraCapability(
        'cap-1',
        'continuous-integration',
        'Continuous Integration',
        'CI description',
        'https://dora.dev/capabilities/continuous-integration/',
        [
          {
            tier: 'beginning',
            actionText: 'Start with basic CI setup',
            doraReference: 'https://dora.dev/ci-basics',
          },
          {
            tier: 'developing',
            actionText: 'Improve build times',
          },
          {
            tier: 'mature',
            actionText: 'Optimize for elite performance',
          },
        ],
      );

      const mockRepository: DoraCapabilityRepository = {
        getAll: vi.fn(),
        getById: vi.fn().mockResolvedValue(capability),
      };
      const service = new GuidanceService(mockRepository);

      const result = await service.getGuidanceForCapability('cap-1', 2.9);

      expect(result).not.toBeNull();
      expect(result!.tier).toBe('beginning');
      expect(result!.guidance?.actionText).toBe('Start with basic CI setup');
      expect(result!.capabilityName).toBe('Continuous Integration');
      expect(result!.score).toBe(2.9);
    });

    test('returns tailored guidance for developing tier at lower boundary', async () => {
      const capability = new DoraCapability(
        'cap-1',
        'continuous-integration',
        'Continuous Integration',
        'CI description',
        'https://dora.dev/capabilities/continuous-integration/',
        [
          {
            tier: 'beginning',
            actionText: 'Start with basic CI setup',
          },
          {
            tier: 'developing',
            actionText: 'Improve build times',
          },
          {
            tier: 'mature',
            actionText: 'Optimize for elite performance',
          },
        ],
      );

      const mockRepository: DoraCapabilityRepository = {
        getAll: vi.fn(),
        getById: vi.fn().mockResolvedValue(capability),
      };
      const service = new GuidanceService(mockRepository);

      const result = await service.getGuidanceForCapability('cap-1', 3.0);

      expect(result).not.toBeNull();
      expect(result!.tier).toBe('developing');
      expect(result!.guidance?.actionText).toBe('Improve build times');
    });

    test('returns tailored guidance for developing tier at upper boundary', async () => {
      const capability = new DoraCapability(
        'cap-1',
        'continuous-integration',
        'Continuous Integration',
        'CI description',
        'https://dora.dev/capabilities/continuous-integration/',
        [
          {
            tier: 'beginning',
            actionText: 'Start with basic CI setup',
          },
          {
            tier: 'developing',
            actionText: 'Improve build times',
          },
          {
            tier: 'mature',
            actionText: 'Optimize for elite performance',
          },
        ],
      );

      const mockRepository: DoraCapabilityRepository = {
        getAll: vi.fn(),
        getById: vi.fn().mockResolvedValue(capability),
      };
      const service = new GuidanceService(mockRepository);

      const result = await service.getGuidanceForCapability('cap-1', 4.9);

      expect(result).not.toBeNull();
      expect(result!.tier).toBe('developing');
      expect(result!.guidance?.actionText).toBe('Improve build times');
    });

    test('returns tailored guidance for mature tier at lower boundary', async () => {
      const capability = new DoraCapability(
        'cap-1',
        'continuous-integration',
        'Continuous Integration',
        'CI description',
        'https://dora.dev/capabilities/continuous-integration/',
        [
          {
            tier: 'beginning',
            actionText: 'Start with basic CI setup',
          },
          {
            tier: 'developing',
            actionText: 'Improve build times',
          },
          {
            tier: 'mature',
            actionText: 'Optimize for elite performance',
          },
        ],
      );

      const mockRepository: DoraCapabilityRepository = {
        getAll: vi.fn(),
        getById: vi.fn().mockResolvedValue(capability),
      };
      const service = new GuidanceService(mockRepository);

      const result = await service.getGuidanceForCapability('cap-1', 5.0);

      expect(result).not.toBeNull();
      expect(result!.tier).toBe('mature');
      expect(result!.guidance?.actionText).toBe(
        'Optimize for elite performance',
      );
    });

    test('returns null guidance when tier guidance is not available', async () => {
      const capability = new DoraCapability(
        'cap-1',
        'continuous-integration',
        'Continuous Integration',
        'CI description',
        'https://dora.dev/capabilities/continuous-integration/',
        [], // No guidance content
      );

      const mockRepository: DoraCapabilityRepository = {
        getAll: vi.fn(),
        getById: vi.fn().mockResolvedValue(capability),
      };
      const service = new GuidanceService(mockRepository);

      const result = await service.getGuidanceForCapability('cap-1', 6.0);

      expect(result).not.toBeNull();
      expect(result!.tier).toBe('mature');
      expect(result!.guidance).toBeNull();
    });
  });
});
