import { createConnection } from './connection.ts';
import _DORA_CAPABILITIES from './dora_capabilities.json' with { type: 'json' };

// TODO: Redesign/Rename/Reframe to "Seeding Survey Model"

type TieredGuidance = {
  tier: 'beginning' | 'developing' | 'mature';
  actionText: string;
};

type DoraCapabilityData = {
  slug: string;
  name: string;
  description: string;
  dora_reference: string;
  tags: string[];
  guidance: TieredGuidance[];
};

const CORE_DORA_CAPABILITIES = (_DORA_CAPABILITIES as DoraCapabilityData[])
  .filter((doraCapability) => doraCapability.tags.includes('core'));

function buildDefaultGuidance(capabilityName: string): TieredGuidance[] {
  return [
    {
      tier: 'beginning',
      actionText:
        `Create a simple baseline for ${capabilityName.toLowerCase()}: agree on one team practice, make it visible in daily work, and review progress every sprint.`,
    },
    {
      tier: 'developing',
      actionText:
        `Strengthen ${capabilityName.toLowerCase()} by measuring where the team still slows down, removing one recurring bottleneck, and standardizing the improved workflow across the team.`,
    },
    {
      tier: 'mature',
      actionText:
        `Keep ${capabilityName.toLowerCase()} strong by automating the checks that protect it, sharing examples with neighboring teams, and revisiting the practice when delivery goals change.`,
    },
  ];
}

function resolveGuidance(capability: DoraCapabilityData): TieredGuidance[] {
  const hasPlaceholderGuidance = capability.guidance.some((guidance) =>
    guidance.actionText.startsWith('TODO:')
  );

  return hasPlaceholderGuidance ? buildDefaultGuidance(capability.name) : capability.guidance;
}

export function seedDoraCapabilities(dbPath: string) {
  const client = createConnection(dbPath);

  try {
    // 1. Seed DORA Capabilities with tiered guidance
    for (const capability of CORE_DORA_CAPABILITIES) {
      const id = crypto.randomUUID();
      const drillDownContent = JSON.stringify(resolveGuidance(capability));
      client.execute(
        `INSERT INTO dora_capabilities (id, slug, name, description, dora_reference, drill_down_content)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT (slug) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           dora_reference = excluded.dora_reference,
           drill_down_content = excluded.drill_down_content`,
        [
          id,
          capability.slug,
          capability.name,
          capability.description,
          capability.dora_reference,
          drillDownContent,
        ],
      );
    }

    // 2. Create Survey Model v1.0
    const modelVersion = 'v1.0';
    const modelId = crypto.randomUUID();

    // Try to insert, or get existing ID if version exists
    client.execute(
      `INSERT INTO survey_models (id, version)
       VALUES (?, ?)
       ON CONFLICT (version) DO NOTHING`,
      [modelId, modelVersion],
    );

    // Get the actual survey model ID (either new or existing)
    const modelResult = client.queryObject<{ id: string }>(
      `SELECT id FROM survey_models WHERE version = ?`,
      [modelVersion],
    );
    const surveyModelId = modelResult.rows[0].id;

    // 3. Link Capabilities to Survey Model as Questions
    // Get all capabilities to have their IDs
    const capResult = client.queryObject<{ id: string; slug: string; name: string }>(
      'SELECT id, slug, name FROM dora_capabilities',
    );
    const capabilities = capResult.rows;

    let sortOrder = 10;
    for (const cap of capabilities) {
      const questionId = crypto.randomUUID();
      const questionText = `To what extent does your team effectively use ${cap.name}?`;
      client.execute(
        `INSERT INTO questions (id, survey_model_id, dora_capability_id, question_text, sort_order)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (survey_model_id, dora_capability_id) DO UPDATE SET
           question_text = excluded.question_text,
           sort_order = excluded.sort_order`,
        [questionId, surveyModelId, cap.id, questionText, sortOrder],
      );
      sortOrder += 10;
    }
  } finally {
    client.end();
  }
}

function seed() {
  const dbPath = Deno.args[0] || Deno.env.get('SURVEY_DB_PATH') || './data/survey.db';
  console.log(`Seeding DORA capabilities into database: ${dbPath}`);

  try {
    seedDoraCapabilities(dbPath);
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  seed();
}
