import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "../db/migrations/schema.js"
import { desc, eq } from 'drizzle-orm'

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: Number(process.env.DB_PORT) || 3306,
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_DB || 'mydb',
});

export const db = drizzle(poolConnection, { schema, mode: 'default'});

export const selectAllTech = async () => {
  const listItem = await db.select()
    .from(schema.techlist)
    .orderBy(desc(schema.techlist.createDate))
  return listItem
}

export const selectTechById = async (id: number) => {
  const listItem = await db.select()
    .from(schema.techlist)
    .where(eq(schema.techlist.projectId, Number(id)))
    .limit(1)
  return listItem
}

export const insertTech = async (projectName: string, techName: string, url: string, repository: string, createDate: string) => {
  const result = await db.insert(schema.techlist).values({
    projectName,
    techName,
    url,
    repository,
    createDate: new Date(createDate).toISOString().split('T')[0]
  })
  return result
}

export const updateTechById = async (id: number, projectName: string, techName: string, url: string, repository: string, createDate: string) => {
  await db.update(schema.techlist)
    .set({
      projectName,
      techName,
      url,
      repository,
      createDate: new Date(createDate).toISOString().split('T')[0]
    })
    .where(eq(schema.techlist.projectId, Number(id)))
}

export const deleteTechById = async (id: number) => {
  await db.delete(schema.techlist)
    .where(eq(schema.techlist.projectId, Number(id)))
}

export const selectUserById = async (userId: string) => {
  const user = await db.select()
    .from(schema.login)
    .where(eq(schema.login.userId, userId))
    .limit(1)
  return user
}