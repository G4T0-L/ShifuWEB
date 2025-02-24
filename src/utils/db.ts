import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL no está definido. Verifica tu configuración.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
