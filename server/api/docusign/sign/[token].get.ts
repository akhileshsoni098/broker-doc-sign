// server/api/docusign/sign/[token].get.ts

import {
  defineEventHandler,
  getRouterParam,
  sendRedirect,
  createError,
} from "h3";

import {
  startSigningService,
} from "~~/server/services/policy/startSigning.service";

export default defineEventHandler(
  async (event) => {

    try {

      // ================= TOKEN =================

      const token = String(
        getRouterParam(
          event,
          "token"
        ) || ""
      );

      if (!token) {
        throw createError({
          statusCode: 400,
          statusMessage:
            "Token is required",
        });
      }

      // ================= START SESSION =================

      const result =
        await startSigningService(
          token
        );

      // ================= REDIRECT =================

      return sendRedirect(
        event,
        result.data.signingUrl,
        302
      );

    } catch (error: any) {

      return {
        status: false,

        message:
          error.statusMessage ||
          error.message ||
          "Something went wrong",
      };
    }
  }
);