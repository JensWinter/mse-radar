-- SQLite schema for MSE Radar
-- Consolidated migration containing all tables, indexes, and constraints

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Teams table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Team memberships table
CREATE TABLE team_memberships (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, team_id)
);

CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);

-- DORA capabilities table
CREATE TABLE dora_capabilities (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  drill_down_content TEXT NOT NULL,
  dora_reference TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_dora_capabilities_slug ON dora_capabilities(slug);

-- Survey models table
CREATE TABLE survey_models (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_survey_models_version ON survey_models(version);

-- Questions table
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  survey_model_id TEXT NOT NULL REFERENCES survey_models(id),
  dora_capability_id TEXT NOT NULL REFERENCES dora_capabilities(id),
  question_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(survey_model_id, dora_capability_id)
);

CREATE INDEX idx_questions_survey_model_id ON questions(survey_model_id);
CREATE INDEX idx_questions_dora_capability_id ON questions(dora_capability_id);

-- Survey runs table
CREATE TABLE survey_runs (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id),
  survey_model_id TEXT NOT NULL REFERENCES survey_models(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'open', 'closed')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_survey_runs_team_id ON survey_runs(team_id);
CREATE INDEX idx_survey_runs_survey_model_id ON survey_runs(survey_model_id);
CREATE INDEX idx_survey_runs_status ON survey_runs(status);

-- Survey responses table
-- Note: answer_values and answer_comments are stored as JSON arrays
CREATE TABLE survey_responses (
  id TEXT PRIMARY KEY,
  survey_run_id TEXT NOT NULL REFERENCES survey_runs(id),
  respondent_id TEXT NOT NULL REFERENCES users(id),
  submitted_at TEXT DEFAULT (datetime('now')),
  answer_values INTEGER NOT NULL DEFAULT '[]',
  answer_comments TEXT NOT NULL DEFAULT '[]',
  UNIQUE(survey_run_id, respondent_id)
);

CREATE INDEX idx_responses_survey_run_id ON survey_responses(survey_run_id);
CREATE INDEX idx_responses_respondent_id ON survey_responses(respondent_id);
