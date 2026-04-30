import { mysqlTable, mysqlSchema, text, int, date } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const login = mysqlTable("login", {
	userId: text().notNull(),
	pass: text().notNull(),
	accept: int().notNull(),
});

export const techlist = mysqlTable("techlist", {
	projectId: int("ProjectID").notNull(),
	projectName: text("ProjectName").default('NULL'),
	techName: text("TechName").default('NULL'),
	url: text("URL").default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	createDate: date("CreateDate", { mode: 'string' }).default("'2019-01-01'").notNull(),
	repository: text("Repository").default('NULL'),
});
