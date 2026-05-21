// server/models/policy/policy.model.ts

import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

import { brokers } from "../broker/broker.model";

// ================= ENUM =================

export const policyStatus = pgEnum("policy_status", ["pending", "signed"]);

// ================= TABLE =================

export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),

  title: text("title").notNull(),

  description: text("description"),

  documentUrl: text("document_url"),

  documentPublicId: text("document_public_id"),

  status: policyStatus("status").notNull().default("pending"),

  signingToken: text("signing_token").unique(),

  brokerId: serial("broker_id")
    .notNull()
    .references(() => brokers.id, {
      onDelete: "cascade",
    }),

  docusignEnvelopeId: text("docusign_envelope_id"),

  signedPdfUrl: text("signed_pdf_url"),

  signedAt: timestamp("signed_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
