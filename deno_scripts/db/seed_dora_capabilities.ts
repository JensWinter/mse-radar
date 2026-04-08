import { createConnection, getDatabaseUrl } from './connection.ts';
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

export async function seedDoraCapabilities(databaseUrl: string) {
  const client = await createConnection(databaseUrl);

  try {
    // 1. Seed DORA Capabilities with tiered guidance
    for (const capability of CORE_DORA_CAPABILITIES) {
      const id = crypto.randomUUID();
      const drillDownContent = JSON.stringify(resolveGuidance(capability));
      await client.execute(
        `INSERT INTO dora_capabilities (id, slug, name, description, dora_reference, drill_down_content)
         VALUES ($1, $2, $3, $4, $5, $6)
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

    await client.execute(
      `INSERT INTO survey_models (id, version)
       VALUES ($1, $2)
       ON CONFLICT (version) DO NOTHING`,
      [modelId, modelVersion],
    );

    // Get the actual survey model ID (either new or existing)
    const modelResult = await client.queryObject<{ id: string }>(
      `SELECT id FROM survey_models WHERE version = $1`,
      [modelVersion],
    );
    const surveyModelId = modelResult.rows[0].id;

    // 3. Link Capabilities to Survey Model as Questions
    const capResult = await client.queryObject<{ id: string; slug: string; name: string }>(
      'SELECT id, slug, name FROM dora_capabilities',
    );
    const capabilities = capResult.rows;

    let sortOrder = 10;
    for (const cap of capabilities) {
      const questionId = crypto.randomUUID();
      const questionText = `To what extent does your team effectively use ${cap.name}?`;
      await client.execute(
        `INSERT INTO questions (id, survey_model_id, dora_capability_id, question_text, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (survey_model_id, dora_capability_id) DO UPDATE SET
           question_text = excluded.question_text,
           sort_order = excluded.sort_order`,
        [questionId, surveyModelId, cap.id, questionText, sortOrder],
      );
      sortOrder += 10;
    }
  } finally {
    await client.end();
  }
}

async function seed() {
  const databaseUrl = Deno.args[0] || getDatabaseUrl();
  console.log(
    `Seeding DORA capabilities into database: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`,
  );

  try {
    await seedDoraCapabilities(databaseUrl);
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await seed();
}
