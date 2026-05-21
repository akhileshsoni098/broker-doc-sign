// server/services/publicSignedPolicyCustomer/signedPolicyByCustomer.service.ts

import { eq } from "drizzle-orm";
import { createError } from "h3";

import { connectDB } from "~~/server/config/db";
import { policies } from "~~/server/models";

import {
  downloadCompletedEnvelopePdf,
  getDocusignAccessToken,
} from "~~/server/utils/docusign";

import { uploadSingleFile } from "~~/server/utils/uploadToCloudinary";

export const signPolicyService = async (envelopeId: string) => {
  const db = await connectDB();

  const policy = await db.query.policies.findFirst({
    where: eq(policies.docusignEnvelopeId, envelopeId),
  });

  if (!policy) {
    throw createError({
      statusCode: 404,
      statusMessage: "Policy not found",
    });
  }

  if (policy.status === "signed") {
    return {
      status: true,
      message: "Policy already signed",
      data: policy,
    };
  }

  const config = useRuntimeConfig();
  const accessToken = await getDocusignAccessToken();

  const pdfBuffer = await downloadCompletedEnvelopePdf({
    accessToken,
    accountId: config.docusignAccountId,
    basePath: config.docusignBasePath,
    envelopeId,
  });

  const uploadResult = await uploadSingleFile(
    {
      data: pdfBuffer,
      filename: `signed-policy-${policy.id}.pdf`,
      type: "application/pdf",
    },
    "signed_policies",
    "raw"
  );

  if (!uploadResult.status || !uploadResult.data) {
    throw createError({
      statusCode: 400,
      statusMessage: uploadResult.message,
    });
  }

  const updated = await db
    .update(policies)
    .set({
      status: "signed",
      signedAt: new Date(),
      signedPdfUrl: uploadResult.data.url,
      updatedAt: new Date(),
    })
    .where(eq(policies.docusignEnvelopeId, envelopeId))
    .returning();

  return {
    status: true,
    message: "Policy signed successfully",
    data: updated[0],
  };
};