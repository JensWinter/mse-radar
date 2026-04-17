-- PostgreSQL schema for MSE Radar

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_memberships (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);

CREATE TABLE dora_capabilities (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  drill_down_content JSONB NOT NULL DEFAULT '[]'::jsonb,
  dora_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dora_capabilities_slug ON dora_capabilities(slug);

CREATE TABLE survey_models (
  id UUID PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_survey_models_version ON survey_models(version);

CREATE TABLE questions (
  id UUID PRIMARY KEY,
  survey_model_id UUID NOT NULL REFERENCES survey_models(id),
  dora_capability_id UUID NOT NULL REFERENCES dora_capabilities(id),
  question_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(survey_model_id, dora_capability_id)
);

CREATE INDEX idx_questions_survey_model_id ON questions(survey_model_id);
CREATE INDEX idx_questions_dora_capability_id ON questions(dora_capability_id);

CREATE TABLE survey_runs (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id),
  survey_model_id UUID NOT NULL REFERENCES survey_models(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_survey_runs_team_id ON survey_runs(team_id);
CREATE INDEX idx_survey_runs_survey_model_id ON survey_runs(survey_model_id);
CREATE INDEX idx_survey_runs_status ON survey_runs(status);

-- answer_values / answer_comments: AES-256-GCM ciphertext
-- (iv(12) || tag(16) || ciphertext) of the JSON-encoded answer arrays.
-- Encryption key held by application (RESPONSE_ENCRYPTION_KEY).
-- See docs/agents/architecture.md → Encryption at rest.
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY,
  survey_run_id UUID NOT NULL REFERENCES survey_runs(id),
  respondent_id UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answer_values BYTEA NOT NULL,
  answer_comments BYTEA NOT NULL,
  UNIQUE(survey_run_id, respondent_id)
);

CREATE INDEX idx_responses_survey_run_id ON survey_responses(survey_run_id);
CREATE INDEX idx_responses_respondent_id ON survey_responses(respondent_id);
