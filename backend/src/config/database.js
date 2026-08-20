const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 20),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT || 10000),
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function checkDatabaseConnection() {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

async function closeDatabase() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  checkDatabaseConnection,
  closeDatabase
};
