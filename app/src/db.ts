import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "../db/migrations/schema.js"

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: Number(process.env.DB_PORT) || 3306,
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_DB || 'mydb',
});

export const db = drizzle(poolConnection, { schema, mode: 'default'});