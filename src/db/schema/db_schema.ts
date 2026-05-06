import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth_schema";

export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(),
  templateName: text("templateName").notNull(),
  templateContent: text("templateContent").notNull(),
  userId: text("userId").references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});
