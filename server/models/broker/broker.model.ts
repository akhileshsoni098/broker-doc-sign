import { pgTable, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core"

export const brokers = pgTable("brokers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("broker"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
