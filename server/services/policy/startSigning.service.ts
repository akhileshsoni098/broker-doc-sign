// server/services/policy/startSigning.service.ts

import { and, eq } from "drizzle-orm";
import { createError } from "h3";

import { connectDB } from "~~/server/config/db";
import { policies } from "~~/server/models";

import {
  createDocusignSigningSession,
  getDocusignAccessToken,
} from "~~/server/utils/docusign";

import { verifySigningToken } from "./signingToken.service";

export const startSigningService = async (token: string) => {
  const db = await connectDB();

  const decoded = verifySigningToken(token);

  if (!decoded) {
    throw createError({
      statusCode: 404,
      statusMessage: "Invalid signing link",
    });
  }

  const policy = await db.query.policies.findFirst({
    where: and(
      eq(policies.id, decoded.policyId),
      eq(policies.brokerId, decoded.brokerId),
      eq(policies.signingToken, token)
    ),
  });

  if (!policy) {
    throw createError({
      statusCode: 404,
      statusMessage: "Policy not found",
    });
  }

  if (policy.status === "signed") {
    throw createError({
      statusCode: 400,
      statusMessage: "Policy already signed",
    });
  }

  if (!policy.documentUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "Policy document missing",
    });
  }

  const config = useRuntimeConfig();
  const accessToken = await getDocusignAccessToken();

  const session = await createDocusignSigningSession({
    accessToken,
    accountId: config.docusignAccountId,
    basePath: config.docusignBasePath,

    signerName: decoded.customerName,
    signerEmail: decoded.customerEmail,
    signingToken: token,
    documentUrl: policy.documentUrl,

    returnUrl: `${config.public.appUrl}/api/docusign/success/${encodeURIComponent(token)}`,
  });

  await db
    .update(policies)
    .set({
      docusignEnvelopeId: session.envelopeId,
      updatedAt: new Date(),
    })
    .where(eq(policies.id, decoded.policyId));

  return {
    status: true,
    message: "Signing session started",
    data: {
      signingUrl: session.signingUrl,
      envelopeId: session.envelopeId,
    },
  };
};