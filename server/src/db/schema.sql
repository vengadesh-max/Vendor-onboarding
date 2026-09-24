-- Postgres DDL Schema for Vendor Onboarding Automation
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vendors_tax_id ON vendors (tax_id);
CREATE INDEX IF NOT EXISTS idx_vendors_bank_account ON vendors (bank_account_number);

CREATE TABLE IF NOT EXISTS runs (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  input_json JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'rejected')),
  final_reasoning TEXT,
  drafted_message TEXT,
  duration_ms INTEGER
);

CREATE TABLE IF NOT EXISTS run_steps (
  id SERIAL PRIMARY KEY,
  run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('intake', 'structural', 'semantic', 'decision', 'communication')),
  step_name TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('pass', 'fail', 'warn')),
  detail TEXT,
  sequence INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_run_steps_run_id ON run_steps (run_id);
