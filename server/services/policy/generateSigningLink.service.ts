// server/services/policy/generateSigningLink.service.ts

import { and, eq } from "drizzle-orm";
import { createError } from "h3";

import { connectDB } from "~~/server/config/db";
import { policies } from "~~/server/models";
import { createSigningToken } from "./signingToken.service";

export const generateSigningLinkService = async (
  policyId: number,
  brokerId: number,
  body: {
    customerName: string;
    customerEmail: string;
  }
) => {
  const db = await connectDB();

  const policy = await db.query.policies.findFirst({
    where: and(eq(policies.id, policyId), eq(policies.brokerId, brokerId)),
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

  if (!body.customerName?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Customer name is required",
    });
  }

  if (!body.customerEmail?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Customer email is required",
    });
  }

  const signingToken = createSigningToken({
    policyId: policy.id,
    brokerId,
    customerName: body.customerName.trim(),
    customerEmail: body.customerEmail.trim(),
  });

  await db
    .update(policies)
    .set({
      signingToken,
      updatedAt: new Date(),
    })
    .where(and(eq(policies.id, policyId), eq(policies.brokerId, brokerId)));

  const config = useRuntimeConfig();

  return {
    status: true,
    message: "Signing link generated successfully",
    data: {
      policyId: policy.id,
      signingToken,
      signUrl: `${config.public.appUrl}/api/docusign/sign/${encodeURIComponent(signingToken)}`,
    },
  };
};