// server/services/publicSignedPolicyCustomer/fetchSigningPolicy.service.ts

import { and, eq } from "drizzle-orm";
import { createError } from "h3";

import { connectDB } from "~~/server/config/db";
import { policies } from "~~/server/models";
import { verifySigningToken } from "~~/server/services/policy/signingToken.service";

export const getPolicyBySigningTokenService = async (token: string) => {
  const decoded = verifySigningToken(token);

  if (!decoded) {
    throw createError({
      statusCode: 404,
      statusMessage: "Invalid signing link",
    });
  }

  const db = await connectDB();

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
      statusMessage: "Invalid signing link",
    });
  }

  return {
    status: true,
    data: policy,
  };
};