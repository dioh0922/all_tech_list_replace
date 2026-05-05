import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    port: Number(process.env.DB_PORT) || 3306,
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_DB || 'mydb',
  },
  tablesFilter: ['techlist', 'login'],
});