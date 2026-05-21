// server/types/h3.d.ts

import type { IBrokerSafe } from "~~/server/types/broker.types";

declare module "h3" {
  interface H3EventContext {
    user?: IBrokerSafe;
  }
}

export {};