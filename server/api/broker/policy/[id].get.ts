// server/api/broker/policy/[id].get.ts

import { defineEventHandler, createError, getRouterParam } from "h3";
import { getPolicyByIdService } from "~~/server/services/policy/policy.service";

export default defineEventHandler(async (event) => {
  try {
    const broker = event.context.broker;

    if (!broker?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const id = Number(getRouterParam(event, "id"));

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid policy id",
      });
    }

    return await getPolicyByIdService(id, broker.id);
  } catch (error: any) {
    return {
      status: false,
      message: error.statusMessage || error.message || "Something went wrong",
    };
  }
});
