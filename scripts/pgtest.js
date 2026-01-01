require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL missing');
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  try {
    const res = await pool.query('select 1 as ok');
    console.log('pg ok:', res.rows[0]);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('pg failed:', e && e.message ? e.message : e);
  process.exit(1);
});
