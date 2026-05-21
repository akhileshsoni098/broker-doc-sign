// server/api/broker/policy/[id].put.ts

import { defineEventHandler, createError, getRouterParam } from "h3";
import {
  parsePolicyMultipart,
  updatePolicyService,
} from "~~/server/services/policy/policy.service";
import type { IUpdatePolicyBody } from "~~/server/types/policy.type";

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

    const { body, document } = await parsePolicyMultipart(event);

    const updateBody: IUpdatePolicyBody = {
      title: body.title || undefined,
      description: body.description || undefined,
    };

    return await updatePolicyService(id, broker.id, updateBody, document);
  } catch (error: any) {
    return {
      status: false,
      message: error.statusMessage || error.message || "Something went wrong",
    };
  }
});
