import { suite, test, expect, vi } from 'vitest';
import { GuidanceService } from './guidance-service.ts';
import type { DoraCapabilityRepository } from '@database/dora-capability-repository.ts';
import { DoraCapability } from '@models/aggregates/dora-capability.ts';

const makeCapability = () =>
  new DoraCapability(
    'cap-1',
    'continuous-integration',
    'Continuous Integration',
    'CI description',
    'https://dora.dev/capabilities/continuous-integration/',
    [
      { level: 1, text: 'Level 1 action' },
      { level: 2, text: 'Level 2 action' },
      { level: 3, text: 'Level 3 action' },
      { level: 4, text: 'Level 4 action' },
      { level: 5, text: 'Level 5 action' },
    ],
  );

const makeService = (capability: DoraCapability | null) => {
  const mockRepository: DoraCapabilityRepository = {
    getAll: vi.fn(),
    getById: vi.fn().mockResolvedValue(capability),
  };
  return new GuidanceService(mockRepository);
};

suite('GuidanceService', () => {
  suite('getGuidanceForCapability', () => {
    test('returns null when capability is not found', async () => {
      const service = makeService(null);
      const result = await service.getGuidanceForCapability('unknown-id', 5.0);
      expect(result).toBeNull();
    });

    test('score 1.0 maps to level 1', async () => {
      const result = await makeService(
        makeCapability(),
      ).getGuidanceForCapability('cap-1', 1.0);
      expect(result!.level).toBe(1);
      expect(result!.guidance?.text).toBe('Level 1 action');
    });

    test('score 1.4 rounds to level 1', async () => {
      const result = await makeService(
        makeCapability(),
      ).getGuidanceForCapability('cap-1', 1.4);
      expect(result!.level).toBe(1);
    });

    test('score 1.5 rounds to level 2', async () => {
      const result = await makeService(
        makeCapability(),
      ).getGuidanceForCapability('cap-1', 1.5);
      expect(result!.level).toBe(2);
    });

    test('score 2.9 rounds to level 3', async () => {
      const result = await makeService(
        makeCapability(),
      ).getGuidanceForCapability('cap-1', 2.9);
      expect(result!.level).toBe(3);
      expect(result!.guidance?.text).toBe('Level 3 action');
    });

    test('score 5.0 maps to level 5', async () => {
      const result = await makeService(
        makeCapability(),
      ).getGuidanceForCapability('cap-1', 5.0);
      expect(result!.level).toBe(5);
      expect(result!.guidance?.text).toBe('Level 5 action');
    });

    test('score above 5 clamps to level 5', async () => {
      const result = await makeService(
        makeCapability(),
      ).getGuidanceForCapability('cap-1', 7.0);
      expect(result!.level).toBe(5);
      expect(result!.guidance?.text).toBe('Level 5 action');
    });

    test('score 0 clamps to level 1', async () => {
      const result = await makeService(
        makeCapability(),
      ).getGuidanceForCapability('cap-1', 0);
      expect(result!.level).toBe(1);
    });

    test('returns null guidance when no matching level exists', async () => {
      const capability = new DoraCapability(
        'cap-1',
        'continuous-integration',
        'CI',
        'desc',
        'https://dora.dev/',
        [],
      );
      const result = await makeService(capability).getGuidanceForCapability(
        'cap-1',
        4.0,
      );
      expect(result).not.toBeNull();
      expect(result!.level).toBe(4);
      expect(result!.guidance).toBeNull();
    });

    test('returns capabilityName and score', async () => {
      const result = await makeService(
        makeCapability(),
      ).getGuidanceForCapability('cap-1', 3.0);
      expect(result!.capabilityName).toBe('Continuous Integration');
      expect(result!.score).toBe(3.0);
    });
  });
});
