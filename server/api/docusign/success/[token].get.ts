// server/api/docusign/success/[token].get.ts

import {
  defineEventHandler,
  getRouterParam,
} from "h3";

import {
  getPolicyBySigningTokenService,
} from "~~/server/services/publicSignedPolicyCustomer/fetchSigningPolicy.service";

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

      // ================= FETCH POLICY =================

      const result =
        await getPolicyBySigningTokenService(
          token
        );

      return {
        status: true,

        message:
          "Signing completed successfully",

        data: {
          policyId:
            result.data.id,

          status:
            result.data.status,

          signedPdfUrl:
            result.data.signedPdfUrl,

          signedAt:
            result.data.signedAt,
        },
      };

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