import { expect, suite, test, vi } from 'vitest';
import { DoraCapabilitiesService } from './dora-capabilities-service.ts';
import type { DoraCapabilityRepository } from '@database/dora-capability-repository.ts';
import { DoraCapability } from '@models/aggregates/dora-capability.ts';

suite('DoraCapabilitiesService', () => {
  suite('getAllDoraCapabilities()', () => {
    test('returns all dora capabilities', async () => {
      // Arrange
      const capabilities = [
        new DoraCapability(
          'id-1',
          'slug-1',
          'name-1',
          'description-1',
          'ref-1',
        ),
        new DoraCapability(
          'id-2',
          'slug-2',
          'name-2',
          'description-2',
          'ref-2',
        ),
      ];
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue(capabilities),
      } as any as DoraCapabilityRepository;
      const service = new DoraCapabilitiesService(mockRepository);

      // Act
      const result = await service.getAllDoraCapabilities();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'id-1',
        slug: 'slug-1',
        name: 'name-1',
        description: 'description-1',
        doraReference: 'ref-1',
        guidance: [],
      });
      expect(result[1]).toEqual({
        id: 'id-2',
        slug: 'slug-2',
        name: 'name-2',
        description: 'description-2',
        doraReference: 'ref-2',
        guidance: [],
      });
    });
  });

  suite('getDoraCapability()', () => {
    test('returns a single dora capability by id', async () => {
      // Arrange
      const capability = new DoraCapability(
        'id-1',
        'slug-1',
        'name-1',
        'description-1',
        'ref-1',
      );
      const mockRepository = {
        getById: vi.fn().mockResolvedValue(capability),
      } as any as DoraCapabilityRepository;
      const service = new DoraCapabilitiesService(mockRepository);

      // Act
      const result = await service.getDoraCapability('id-1');

      // Assert
      expect(result).toEqual({
        id: 'id-1',
        slug: 'slug-1',
        name: 'name-1',
        description: 'description-1',
        doraReference: 'ref-1',
        guidance: [],
      });
      expect(mockRepository.getById).toHaveBeenCalledWith('id-1');
    });

    test('returns null when capability is not found', async () => {
      // Arrange
      const mockRepository = {
        getById: vi.fn().mockResolvedValue(null),
      } as any as DoraCapabilityRepository;
      const service = new DoraCapabilitiesService(mockRepository);

      // Act
      const result = await service.getDoraCapability('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  suite('getDoraCapabilitiesByIds()', () => {
    test('returns capabilities for each unique capability id', async () => {
      // Arrange
      const mockRepository = {
        getAll: vi
          .fn()
          .mockResolvedValue([
            new DoraCapability('cap-1', 'slug-1', 'name-1', 'desc-1', 'ref-1'),
            new DoraCapability('cap-2', 'slug-2', 'name-2', 'desc-2', 'ref-2'),
          ]),
      } as any as DoraCapabilityRepository;
      const service = new DoraCapabilitiesService(mockRepository);

      // Act
      const result = await service.getDoraCapabilitiesByIds(['cap-1', 'cap-2']);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'cap-1',
        slug: 'slug-1',
        name: 'name-1',
        description: 'desc-1',
        doraReference: 'ref-1',
        guidance: [],
      });
      expect(result[1]).toEqual({
        id: 'cap-2',
        slug: 'slug-2',
        name: 'name-2',
        description: 'desc-2',
        doraReference: 'ref-2',
        guidance: [],
      });
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });

    test('filters out capabilities that are not found', async () => {
      // Arrange
      const mockRepository = {
        getAll: vi
          .fn()
          .mockResolvedValue([
            new DoraCapability('cap-1', 'slug-1', 'name-1', 'desc-1', 'ref-1'),
          ]),
      } as any as DoraCapabilityRepository;
      const service = new DoraCapabilitiesService(mockRepository);

      // Act
      const result = await service.getDoraCapabilitiesByIds([
        'cap-1',
        'cap-missing',
      ]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'cap-1',
        slug: 'slug-1',
        name: 'name-1',
        description: 'desc-1',
        doraReference: 'ref-1',
        guidance: [],
      });
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });

    test('returns empty array when no ids are provided', async () => {
      // Arrange
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      } as any as DoraCapabilityRepository;
      const service = new DoraCapabilitiesService(mockRepository);

      // Act
      const result = await service.getDoraCapabilitiesByIds([]);

      // Assert
      expect(result).toHaveLength(0);
      expect(mockRepository.getAll).not.toHaveBeenCalled();
    });
  });
});
