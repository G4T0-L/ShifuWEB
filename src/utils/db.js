import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';


if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL no está definido. Verifica tu archivo .env.");
}


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default {
  query: (text, params) => pool.query(text, params),
};
