// server/api/broker/policy/index.post.ts

import { defineEventHandler, createError } from "h3";
import {
  parsePolicyMultipart,
  createPolicyService,
} from "~~/server/services/policy/policy.service";

export default defineEventHandler(async (event) => {
  try {
    const broker = event.context.broker;

    if (!broker?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const { body, document } = await parsePolicyMultipart(event);

    return await createPolicyService(body, broker.id, document);
  } catch (error: any) {
    return {
      status: false,
      message: error.statusMessage || error.message || "Something went wrong",
    };
  }
});
