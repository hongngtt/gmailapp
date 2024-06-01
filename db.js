require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: 'dpg-cp92rc5ds78s73cc5gcg-a.virginia-postgres.render.com',
  database: 'userdb_22tl',
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
  ssl: true
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

async function syncDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS GmailUsers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      googleId VARCHAR(255) NOT NULL UNIQUE
    );
  `;
  await pool.query(createTableQuery);
  console.log('Database synced!');
}

async function createUser(email, googleId) {
  const insertUserQuery = `
    INSERT INTO GmailUsers (email, googleId)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const result = await pool.query(insertUserQuery, [email, googleId]);
  return result.rows[0];
}

async function findUserByGoogleId(googleId) {
  const findUserQuery = `
    SELECT * FROM GmailUsers
    WHERE googleId = $1;
  `;
  const result = await pool.query(findUserQuery, [googleId]);
  return result.rows[0];
}

module.exports = {
  syncDatabase,
  createUser,
  findUserByGoogleId,
};
