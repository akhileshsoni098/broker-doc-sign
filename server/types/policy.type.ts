// server/types/policy.types.ts

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { policies } from "~~/server/models";

export type IPolicy = InferSelectModel<typeof policies>;
export type INewPolicy = InferInsertModel<typeof policies>;

export interface ICreatePolicyBody {
  title: string;
  description?: string;
}

export interface IUpdatePolicyBody {
  title?: string;
  description?: string;
}

export interface IMultipartFile {
  data: Buffer;
  type?: string;
  filename?: string;
}

export interface IPolicyRouteContext {
  user?: {
    id: number;
    name?: string | null;
    email: string;
    role?: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  };
}