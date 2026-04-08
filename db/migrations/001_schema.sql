-- PostgreSQL schema for MSE Radar
-- Consolidated migration containing all tables, indexes, and constraints

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT NOW()
);

-- Team memberships table
CREATE TABLE team_memberships (
  id uuid PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES teams(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);

-- DORA capabilities table
CREATE TABLE dora_capabilities (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  drill_down_content jsonb NOT NULL,
  dora_reference text NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX idx_dora_capabilities_slug ON dora_capabilities(slug);

-- Survey models table
CREATE TABLE survey_models (
  id uuid PRIMARY KEY,
  version text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX idx_survey_models_version ON survey_models(version);

-- Questions table
CREATE TABLE questions (
  id uuid PRIMARY KEY,
  survey_model_id uuid NOT NULL REFERENCES survey_models(id),
  dora_capability_id uuid NOT NULL REFERENCES dora_capabilities(id),
  question_text text NOT NULL,
  sort_order integer NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(survey_model_id, dora_capability_id)
);

CREATE INDEX idx_questions_survey_model_id ON questions(survey_model_id);
CREATE INDEX idx_questions_dora_capability_id ON questions(dora_capability_id);

-- Survey runs table
CREATE TABLE survey_runs (
  id uuid PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES teams(id),
  survey_model_id uuid NOT NULL REFERENCES survey_models(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'open', 'closed')),
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX idx_survey_runs_team_id ON survey_runs(team_id);
CREATE INDEX idx_survey_runs_survey_model_id ON survey_runs(survey_model_id);
CREATE INDEX idx_survey_runs_status ON survey_runs(status);

-- Survey responses table
-- Note: answer_values and answer_comments are stored as jsonb arrays
CREATE TABLE survey_responses (
  id uuid PRIMARY KEY,
  survey_run_id uuid NOT NULL REFERENCES survey_runs(id),
  respondent_id uuid NOT NULL REFERENCES users(id),
  submitted_at timestamptz DEFAULT NOW(),
  answer_values jsonb NOT NULL DEFAULT '[]',
  answer_comments jsonb NOT NULL DEFAULT '[]',
  UNIQUE(survey_run_id, respondent_id)
);

CREATE INDEX idx_responses_survey_run_id ON survey_responses(survey_run_id);
CREATE INDEX idx_responses_respondent_id ON survey_responses(respondent_id);
