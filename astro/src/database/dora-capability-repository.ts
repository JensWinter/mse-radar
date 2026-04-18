import {
  DoraCapability,
  type LevelGuidance,
} from '@models/aggregates/dora-capability.ts';
import { query } from '@database/db.ts';

export interface DoraCapabilityRepository {
  getAll(): Promise<DoraCapability[]>;
  getById(id: string): Promise<DoraCapability | null>;
}

type DoraCapabilityRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  dora_reference: string;
  drill_down_content: LevelGuidance[];
};

export class PgDoraCapabilityRepository implements DoraCapabilityRepository {
  async getAll(): Promise<DoraCapability[]> {
    const result = await query<DoraCapabilityRow>(
      'SELECT id, slug, name, description, dora_reference, drill_down_content FROM dora_capabilities',
    );
    return result.rows.map((row) => this.rowToDoraCapability(row));
  }

  async getById(id: string): Promise<DoraCapability | null> {
    const doraCapabilityRows = await query<DoraCapabilityRow>(
      'SELECT id, slug, name, description, dora_reference, drill_down_content FROM dora_capabilities WHERE id = $1',
      [id],
    );

    const doraCapabilityRow = doraCapabilityRows.rows[0];
    if (!doraCapabilityRow) {
      return null;
    }

    return this.rowToDoraCapability(doraCapabilityRow);
  }

  private rowToDoraCapability(row: DoraCapabilityRow): DoraCapability {
    return new DoraCapability(
      row.id,
      row.slug,
      row.name,
      row.description,
      row.dora_reference,
      row.drill_down_content,
    );
  }
}
