import type { DoraCapabilityRepository } from '@database/dora-capability-repository.ts';
import type {
  GuidanceTier,
  TieredGuidance,
} from '@models/aggregates/dora-capability.ts';

export type TailoredGuidance = {
  capabilityId: string;
  capabilityName: string;
  score: number;
  tier: GuidanceTier;
  guidance: TieredGuidance | null;
  doraReference: string;
};

export class GuidanceService {
  constructor(
    private readonly doraCapabilityRepository: DoraCapabilityRepository,
  ) {}

  /**
   * Gets tailored guidance for a specific capability based on the team's score.
   */
  async getGuidanceForCapability(
    capabilityId: string,
    score: number,
  ): Promise<TailoredGuidance | null> {
    const capability =
      await this.doraCapabilityRepository.getById(capabilityId);
    if (!capability) {
      return null;
    }

    const tier = GuidanceService.getTierForScore(score);
    const guidance =
      capability.drillDownContent.find((g) => g.tier === tier) ?? null;

    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      score,
      tier,
      guidance,
      doraReference: capability.doraReference,
    };
  }

  /**
   * Determines the guidance tier based on a score (1-7 Likert scale).
   * - Beginning: 1.0 - 2.9
   * - Developing: 3.0 - 4.9
   * - Mature: 5.0 - 7.0
   */
  private static getTierForScore(score: number): GuidanceTier {
    if (score < 3.0) {
      return 'beginning';
    } else if (score < 5.0) {
      return 'developing';
    } else {
      return 'mature';
    }
  }
}
