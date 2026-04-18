import type { DoraCapabilityRepository } from '@database/dora-capability-repository.ts';
import type { LevelGuidance } from '@models/aggregates/dora-capability.ts';

export type TailoredGuidance = {
  capabilityId: string;
  capabilityName: string;
  score: number;
  level: number;
  guidance: LevelGuidance | null;
  doraReference: string;
};

export class GuidanceService {
  constructor(
    private readonly doraCapabilityRepository: DoraCapabilityRepository,
  ) {}

  async getGuidanceForCapability(
    capabilityId: string,
    score: number,
  ): Promise<TailoredGuidance | null> {
    const capability =
      await this.doraCapabilityRepository.getById(capabilityId);
    if (!capability) {
      return null;
    }

    const level = Math.min(7, Math.max(1, Math.round(score)));
    const guidance =
      capability.drillDownContent.find((g) => g.level === level) ?? null;

    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      score,
      level,
      guidance,
      doraReference: capability.doraReference,
    };
  }
}
