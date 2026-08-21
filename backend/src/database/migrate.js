const fs = require('fs');
const path = require('path');

const { query, closeDatabase } = require('../config/database');

const migrationsDir = path.join(__dirname, '../../migrations');

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function runMigrations() {
  await ensureMigrationsTable();

  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  const result = await query(
    `SELECT filename FROM schema_migrations ORDER BY filename`
  );

  const executed = new Set(
    result.rows.map(row => row.filename)
  );

  for (const file of files) {
    if (executed.has(file)) {
      console.log(`SKIP ${file}`);
      continue;
    }

    console.log(`RUN  ${file}`);

    const sql = fs.readFileSync(
      path.join(migrationsDir, file),
      'utf8'
    );

    const client = await require('../config/database').pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(sql);

      await client.query(
        `
          INSERT INTO schema_migrations (filename)
          VALUES ($1)
        `,
        [file]
      );

      await client.query('COMMIT');

      console.log(`DONE ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

runMigrations()
  .then(async () => {
    console.log('ALL MIGRATIONS COMPLETED');
    await closeDatabase();
  })
  .catch(async error => {
    console.error('MIGRATION ERROR:', error.message);
    await closeDatabase();
    process.exit(1);
  });
