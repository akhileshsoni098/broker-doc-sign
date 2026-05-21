// server/api/docusign/webhook.post.ts

import {
  defineEventHandler,
  readBody,
} from "h3";

import {
  signPolicyService,
} from "~~/server/services/publicSignedPolicyCustomer/signedPolicyByCustomer.service";

export default defineEventHandler(
  async (event) => {

    try {

      // ================= BODY =================

      const body =
        await readBody(event);

      console.log(
        "DOCUSIGN WEBHOOK BODY:",
        body
      );

      // ================= ENVELOPE ID =================

      const envelopeId =
        body?.envelopeId ||
        body?.envelope_id ||
        body?.data?.envelopeId ||
        body?.data?.envelope_id;

      if (!envelopeId) {

        return {
          status: false,
          message:
            "Envelope ID is required",
        };
      }

      // ================= COMPLETE SIGNING =================

      return await
      signPolicyService(
        String(envelopeId)
      );

    } catch (error: any) {

      console.error(
        "DOCUSIGN WEBHOOK ERROR:",
        error
      );

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