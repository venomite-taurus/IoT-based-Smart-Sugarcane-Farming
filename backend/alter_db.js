const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const run = async () => {
  try {
    await pool.query('ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS node VARCHAR(50)');
    console.log('Successfully added node column');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
};

run();
