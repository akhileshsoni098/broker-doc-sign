// server/models/broker/broker.model.ts

import {
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const brokers = pgTable("brokers", {
  id: serial("id").primaryKey(),

  name: text("name"),

  email: text("email")
    .notNull()
    .unique(),

  password: text("password")
    .notNull(),

  role: text("role")
    .$type<"broker">()
    .default("broker"),

  createdAt: timestamp("created_at")
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .defaultNow(),
});