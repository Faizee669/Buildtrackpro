import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({path: '../../.env'});

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT p.user_id, count(e.id) as expense_count 
      FROM projects p 
      LEFT JOIN expenses e ON e.project_id = p.id 
      GROUP BY p.user_id
    `);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
