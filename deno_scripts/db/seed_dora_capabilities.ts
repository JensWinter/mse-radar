import { createConnection, getDatabaseUrlOrExit, type Sql } from './connection.ts';
import _DORA_CAPABILITIES from './dora_capabilities.json' with { type: 'json' };

type LevelGuidance = {
  level: number;
  text: string;
};

type DoraCapabilityData = {
  slug: string;
  name: string;
  question: string;
  description: string;
  dora_reference: string;
  guidance: LevelGuidance[];
};

const DORA_CAPABILITIES = _DORA_CAPABILITIES as DoraCapabilityData[];

export async function seedDoraCapabilities(databaseUrl: string) {
  const sql = createConnection(databaseUrl);

  try {
    await seedWithConnection(sql);
  } finally {
    await sql.end();
  }
}

export async function seedWithConnection(sql: Sql) {
  // 1. Seed DORA Capabilities with leveled guidance
  for (const capability of DORA_CAPABILITIES) {
    const id = crypto.randomUUID();
    await sql.unsafe(
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
        capability.guidance,
      ],
    );
  }

  // 2. Create Survey Model v1.0
  const modelVersion = 'v1.0';
  const modelId = crypto.randomUUID();

  await sql.unsafe(
    `INSERT INTO survey_models (id, version) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING`,
    [modelId, modelVersion],
  );

  const modelResult = await sql.unsafe<{ id: string }[]>(
    `SELECT id FROM survey_models WHERE version = $1`,
    [modelVersion],
  );
  const surveyModelId = modelResult[0].id;

  // 3. Link Capabilities to Survey Model as Questions
  const capResult = await sql.unsafe<{ id: string; slug: string }[]>(
    'SELECT id, slug FROM dora_capabilities',
  );

  const capabilityBySlug = new Map(DORA_CAPABILITIES.map((c) => [c.slug, c]));

  let sortOrder = 10;
  for (const cap of capResult) {
    const capabilityData = capabilityBySlug.get(cap.slug);
    if (!capabilityData) {
      throw new Error(`Capability with slug '${cap.slug}' not found in DORA_CAPABILITIES`);
    }

    const questionText = capabilityData.question;
    const questionId = crypto.randomUUID();
    await sql.unsafe(
      `INSERT INTO questions (id, survey_model_id, dora_capability_id, question_text, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (survey_model_id, dora_capability_id) DO UPDATE SET
         question_text = excluded.question_text,
         sort_order = excluded.sort_order`,
      [questionId, surveyModelId, cap.id, questionText, sortOrder],
    );
    sortOrder += 10;
  }
}

async function seed() {
  const databaseUrl = getDatabaseUrlOrExit();

  console.log('Seeding DORA capabilities');

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
