import {
  AnySQLiteColumn,
  int,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { user } from "./auth_schema";

export const templatesTable = sqliteTable("templates_table", {
  id: int().primaryKey({ autoIncrement: true }),
  templateName: text().notNull(),
  templateContent: text().notNull(),
  userId: int().references((): AnySQLiteColumn => user.id),
});
