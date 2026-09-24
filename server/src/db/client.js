import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConfig, loadEnv } from '../config/env.js';
import { SEED_VENDORS } from './seedData.js';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbInstance = null;

export async function getDbClient() {
  if (dbInstance) return dbInstance;

  loadEnv();
  const cfg = getConfig();

  if (cfg.databaseUrl) {
    const pool = new Pool({
      connectionString: cfg.databaseUrl,
      ssl: cfg.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    });

    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);

    dbInstance = {
      type: 'postgres',
      pool,

      async getAllVendors() {
        const res = await pool.query('SELECT id, company_name, tax_id, bank_account_number, country FROM vendors');
        return res.rows;
      },

      async saveRun({ inputJson, status, finalReasoning, draftedMessage, durationMs, steps }) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const runRes = await client.query(
            `INSERT INTO runs (input_json, status, final_reasoning, drafted_message, duration_ms)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [
              typeof inputJson === 'string' ? JSON.parse(inputJson) : inputJson,
              status,
              finalReasoning,
              draftedMessage,
              durationMs,
            ]
          );
          const runId = runRes.rows[0].id;

          for (let i = 0; i < steps.length; i++) {
            const s = steps[i];
            await client.query(
              `INSERT INTO run_steps (run_id, stage, step_name, result, detail, sequence)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [runId, s.stage, s.step_name, s.result, s.detail, i + 1]
            );
          }

          await client.query('COMMIT');
          return runId;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      },

      async getAllRuns() {
        const res = await pool.query(
          `SELECT id, submitted_at, input_json, status, final_reasoning, drafted_message, duration_ms
           FROM runs ORDER BY submitted_at DESC`
        );
        return res.rows.map((r) => {
          let company_name = 'Unknown';
          try {
            const parsed = typeof r.input_json === 'string' ? JSON.parse(r.input_json) : r.input_json;
            company_name = parsed?.company_name || company_name;
          } catch {
            /* ignore */
          }
          return {
            id: r.id,
            company_name,
            input_json: r.input_json,
            submitted_at: r.submitted_at,
            status: r.status,
            duration_ms: r.duration_ms,
          };
        });
      },

      async getRunById(id) {
        const runRes = await pool.query(
          `SELECT id, submitted_at, input_json, status, final_reasoning, drafted_message, duration_ms
           FROM runs WHERE id = $1`,
          [id]
        );
        if (runRes.rows.length === 0) return null;
        const run = runRes.rows[0];

        const stepsRes = await pool.query(
          `SELECT stage, step_name, result, detail, sequence
           FROM run_steps WHERE run_id = $1 ORDER BY sequence ASC`,
          [id]
        );

        let input = null;
        try {
          input = typeof run.input_json === 'string' ? JSON.parse(run.input_json) : run.input_json;
        } catch {
          input = run.input_json;
        }

        return {
          run_id: run.id,
          submitted_at: run.submitted_at,
          status: run.status,
          final_reasoning: run.final_reasoning,
          drafted_message: run.drafted_message,
          duration_ms: run.duration_ms,
          input,
          steps: stepsRes.rows,
        };
      },

      async seedVendorsIfEmpty() {
        const res = await pool.query('SELECT COUNT(*) AS c FROM vendors');
        if (parseInt(res.rows[0].c, 10) > 0) return 0;

        for (const v of SEED_VENDORS) {
          await pool.query(
            `INSERT INTO vendors (company_name, tax_id, bank_account_number, country)
             VALUES ($1, $2, $3, $4)`,
            [v.company_name, v.tax_id, v.bank_account_number, v.country]
          );
        }
        return SEED_VENDORS.length;
      },
    };

    await dbInstance.seedVendorsIfEmpty();
    return dbInstance;
  }

  // SQLite dynamic load attempt
  try {
    const { default: Database } = await import('better-sqlite3');
    const dbPath = cfg.dbPath;
    const resolved = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const sqliteDb = new Database(resolved);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');

    const sqliteSchema = `
      CREATE TABLE IF NOT EXISTS vendors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        tax_id TEXT NOT NULL,
        bank_account_number TEXT NOT NULL,
        country TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_vendors_tax_id ON vendors(tax_id);
      CREATE INDEX IF NOT EXISTS idx_vendors_bank_account ON vendors(bank_account_number);

      CREATE TABLE IF NOT EXISTS runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        input_json TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'rejected')),
        final_reasoning TEXT NOT NULL,
        drafted_message TEXT,
        duration_ms INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS run_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
        stage TEXT NOT NULL,
        step_name TEXT NOT NULL,
        result TEXT NOT NULL CHECK (result IN ('pass', 'fail', 'warn')),
        detail TEXT NOT NULL,
        sequence INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_run_steps_run_id ON run_steps(run_id);
    `;
    sqliteDb.exec(sqliteSchema);

    dbInstance = {
      type: 'sqlite',
      sqliteDb,

      async getAllVendors() {
        return sqliteDb.prepare('SELECT id, company_name, tax_id, bank_account_number, country FROM vendors').all();
      },

      async saveRun({ inputJson, status, finalReasoning, draftedMessage, durationMs, steps }) {
        const insertRun = sqliteDb.prepare(`
          INSERT INTO runs (input_json, status, final_reasoning, drafted_message, duration_ms)
          VALUES (?, ?, ?, ?, ?)
        `);
        const insertStep = sqliteDb.prepare(`
          INSERT INTO run_steps (run_id, stage, step_name, result, detail, sequence)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        const tx = sqliteDb.transaction(() => {
          const info = insertRun.run(
            typeof inputJson === 'string' ? inputJson : JSON.stringify(inputJson),
            status,
            finalReasoning,
            draftedMessage,
            durationMs
          );
          const runId = info.lastInsertRowid;
          steps.forEach((s, i) => {
            insertStep.run(runId, s.stage, s.step_name, s.result, s.detail, i + 1);
          });
          return runId;
        });

        return tx();
      },

      async getAllRuns() {
        const rows = sqliteDb
          .prepare(
            `SELECT id, submitted_at, input_json, status, final_reasoning, drafted_message, duration_ms
             FROM runs ORDER BY submitted_at DESC`
          )
          .all();

        return rows.map((r) => {
          let company_name = 'Unknown';
          try {
            const parsed = JSON.parse(r.input_json);
            company_name = parsed?.company_name || company_name;
          } catch {
            /* ignore */
          }
          return {
            id: r.id,
            company_name,
            input_json: r.input_json,
            submitted_at: r.submitted_at,
            status: r.status,
            duration_ms: r.duration_ms,
          };
        });
      },

      async getRunById(id) {
        const run = sqliteDb
          .prepare(
            `SELECT id, submitted_at, input_json, status, final_reasoning, drafted_message, duration_ms
             FROM runs WHERE id = ?`
          )
          .get(id);

        if (!run) return null;

        const steps = sqliteDb
          .prepare(
            `SELECT stage, step_name, result, detail, sequence
             FROM run_steps WHERE run_id = ? ORDER BY sequence ASC`
          )
          .all(id);

        let input = null;
        try {
          input = JSON.parse(run.input_json);
        } catch {
          input = run.input_json;
        }

        return {
          run_id: run.id,
          submitted_at: run.submitted_at,
          status: run.status,
          final_reasoning: run.final_reasoning,
          drafted_message: run.drafted_message,
          duration_ms: run.duration_ms,
          input,
          steps,
        };
      },

      async seedVendorsIfEmpty() {
        const count = sqliteDb.prepare('SELECT COUNT(*) AS c FROM vendors').get().c;
        if (count > 0) return 0;
        const insert = sqliteDb.prepare(`
          INSERT INTO vendors (company_name, tax_id, bank_account_number, country)
          VALUES (@company_name, @tax_id, @bank_account_number, @country)
        `);
        const tx = sqliteDb.transaction((rows) => {
          for (const row of rows) insert.run(row);
        });
        tx(SEED_VENDORS);
        return SEED_VENDORS.length;
      },
    };

    await dbInstance.seedVendorsIfEmpty();
    return dbInstance;
  } catch {
    // In-memory fallback if SQLite module is missing
    const state = {
      vendors: [],
      runs: [],
      run_steps: [],
      nextVendorId: 1,
      nextRunId: 1,
      nextStepId: 1,
    };

    dbInstance = {
      type: 'memory',
      async getAllVendors() {
        return state.vendors.map(({ id, company_name, tax_id, bank_account_number, country }) => ({
          id,
          company_name,
          tax_id,
          bank_account_number,
          country,
        }));
      },
      async saveRun({ inputJson, status, finalReasoning, draftedMessage, durationMs, steps }) {
        const runId = state.nextRunId++;
        state.runs.push({
          id: runId,
          submitted_at: new Date().toISOString(),
          input_json: typeof inputJson === 'string' ? inputJson : JSON.stringify(inputJson),
          status,
          final_reasoning: finalReasoning,
          drafted_message: draftedMessage,
          duration_ms: durationMs,
        });
        steps.forEach((s, i) => {
          state.run_steps.push({
            id: state.nextStepId++,
            run_id: runId,
            ...s,
            sequence: i + 1,
          });
        });
        return runId;
      },
      async getAllRuns() {
        return [...state.runs].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)).map((r) => {
          let company_name = 'Unknown';
          try {
            const parsed = typeof r.input_json === 'string' ? JSON.parse(r.input_json) : r.input_json;
            company_name = parsed?.company_name || company_name;
          } catch {
            /* ignore */
          }
          return {
            id: r.id,
            company_name,
            input_json: r.input_json,
            submitted_at: r.submitted_at,
            status: r.status,
            duration_ms: r.duration_ms,
          };
        });
      },
      async getRunById(id) {
        const run = state.runs.find((r) => r.id === id);
        if (!run) return null;
        const steps = state.run_steps
          .filter((s) => s.run_id === id)
          .sort((a, b) => a.sequence - b.sequence);
        let input = null;
        try {
          input = typeof run.input_json === 'string' ? JSON.parse(run.input_json) : run.input_json;
        } catch {
          input = run.input_json;
        }
        return {
          run_id: run.id,
          submitted_at: run.submitted_at,
          status: run.status,
          final_reasoning: run.final_reasoning,
          drafted_message: run.drafted_message,
          duration_ms: run.duration_ms,
          input,
          steps,
        };
      },
      async seedVendorsIfEmpty() {
        if (state.vendors.length > 0) return 0;
        SEED_VENDORS.forEach((v) => {
          state.vendors.push({
            id: state.nextVendorId++,
            ...v,
            created_at: new Date().toISOString(),
          });
        });
        return SEED_VENDORS.length;
      },
    };

    await dbInstance.seedVendorsIfEmpty();
    return dbInstance;
  }
}
