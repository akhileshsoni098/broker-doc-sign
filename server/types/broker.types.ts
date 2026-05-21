// server/types/broker.types.ts

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { brokers } from "~~/server/models";

// ================= DB TYPES =================

export type IBroker = InferSelectModel<typeof brokers>;

export type INewBroker = InferInsertModel<typeof brokers>;

// ================= API BODY TYPE =================

export interface IBrokerAuthBody {
  type: "login" | "register";

  name?: string;

  email: string;

  password: string;
}
