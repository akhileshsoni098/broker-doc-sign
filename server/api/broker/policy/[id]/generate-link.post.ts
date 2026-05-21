// server/api/broker/policy/[id]/generate-link.post.ts

import { defineEventHandler, readBody, getRouterParam, createError } from "h3";

import { generateSigningLinkService } from "~~/server/services/policy/generateSigningLink.service";

export default defineEventHandler(async (event) => {
  try {
    // ================= AUTH =================

    const broker = event.context.broker;

    if (!broker?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    // ================= PARAM =================

    const id = Number(getRouterParam(event, "id"));

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid policy id",
      });
    }

    // ================= BODY =================

    const body = await readBody(event);

    // ================= SERVICE =================

    return await generateSigningLinkService(id, broker.id, {
      customerName: body.customerName,

      customerEmail: body.customerEmail,
    });
  } catch (error: any) {
    return {
      status: false,

      message: error.statusMessage || error.message || "Something went wrong",
    };
  }
});
