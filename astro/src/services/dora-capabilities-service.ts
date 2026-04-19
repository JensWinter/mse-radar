import {
  DoraCapability,
  type LevelGuidance,
} from '@models/aggregates/dora-capability.ts';
import type { DoraCapabilityRepository } from '@database/dora-capability-repository.ts';

export class DoraCapabilitiesService {
  constructor(
    private readonly doraCapabilityRepository: DoraCapabilityRepository,
  ) {}

  async getAllDoraCapabilities(): Promise<DoraCapabilityDto[]> {
    const capabilities = await this.doraCapabilityRepository.getAll();
    return capabilities.map((capability) => this.toDto(capability));
  }

  async getDoraCapability(id: string): Promise<DoraCapabilityDto | null> {
    const doraCapability = await this.doraCapabilityRepository.getById(id);
    return doraCapability ? this.toDto(doraCapability) : null;
  }

  async getDoraCapabilitiesByIds(
    doraCapabilityIds: string[],
  ): Promise<DoraCapabilityDto[]> {
    if (doraCapabilityIds.length === 0) {
      return [];
    }

    const doraCapabilities = await this.getAllDoraCapabilities();

    return doraCapabilityIds
      .map((id) => {
        const capability = doraCapabilities.find((c) => c.id === id);
        return capability ?? null;
      })
      .filter(
        (capability): capability is DoraCapabilityDto => capability !== null,
      );
  }

  private toDto(capability: DoraCapability): DoraCapabilityDto {
    return {
      id: capability.id,
      slug: capability.slug,
      name: capability.name,
      description: capability.description,
      doraReference: capability.doraReference,
      guidance: capability.drillDownContent,
    };
  }
}

export type DoraCapabilityDto = {
  id: string;
  slug: string;
  name: string;
  description: string;
  doraReference: string;
  guidance: LevelGuidance[];
};

export type { LevelGuidance };
