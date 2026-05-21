// server/services/policy/policy.service.ts

import { and, desc, eq } from "drizzle-orm";
import { createError, H3Event, readMultipartFormData } from "h3";

import { connectDB } from "~~/server/config/db";
import { policies } from "~~/server/models";
import { deleteSingleFile, uploadSingleFile } from "~~/server/utils/uploadToCloudinary";
import type { ICreatePolicyBody, IMultipartFile, IUpdatePolicyBody } from "~~/server/types/policy.type"

const toText = (value?: Buffer) => (value ? value.toString("utf8").trim() : "");

const getField = (formData: Awaited<ReturnType<typeof readMultipartFormData>>, name: string) => {
  const field = formData?.find((item) => item.name === name);
  return toText(field?.data);
};

const getFile = (formData: Awaited<ReturnType<typeof readMultipartFormData>>, name: string): IMultipartFile | undefined => {
  const file = formData?.find((item) => item.name === name);
  if (!file?.data) return undefined;

  return {
    data: file.data,
    type: file.type,
    filename: file.filename,
  };
};

export const parsePolicyMultipart = async (event: H3Event) => {
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Multipart form data is required",
    });
  }

  const title = getField(formData, "title");
  const description = getField(formData, "description");
  const document = getFile(formData, "document");

  return {
    body: {
      title,
      description,
    } satisfies ICreatePolicyBody,
    document,
  };
};

export const createPolicyService = async (
  body: ICreatePolicyBody,
  brokerId: number,
  document?: IMultipartFile
) => {
  const db = await connectDB();

  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: "Title is required",
    });
  }

  if (!document) {
    throw createError({
      statusCode: 400,
      statusMessage: "Document is required",
    });
  }

  if (document.type !== "application/pdf") {
    throw createError({
      statusCode: 400,
      statusMessage: "Only PDF files are allowed",
    });
  }

  const uploadResult = await uploadSingleFile(document, "policy_pdfs", "raw");

  if (!uploadResult.status || !uploadResult.data) {
    throw createError({
      statusCode: 400,
      statusMessage: uploadResult.message,
    });
  }

  const inserted = await db
    .insert(policies)
    .values({
      title: body.title,
      description: body.description || null,
      documentUrl: uploadResult.data.url,
      documentPublicId: uploadResult.data.filename,
      brokerId,
      status: "pending",
    })
    .returning();

  return {
    status: true,
    message: "Policy created successfully",
    data: inserted[0],
  };
};

export const getPoliciesService = async (brokerId: number) => {
  const db = await connectDB();

  const list = await db
    .select()
    .from(policies)
    .where(eq(policies.brokerId, brokerId))
    .orderBy(desc(policies.createdAt));

  return {
    status: true,
    message: "Policies fetched successfully",
    data: list,
  };
};

export const getPolicyByIdService = async (id: number, brokerId: number) => {
  const db = await connectDB();

  const policy = await db
    .select()
    .from(policies)
    .where(and(eq(policies.id, id), eq(policies.brokerId, brokerId)))
    .limit(1);

  if (!policy.length) {
    throw createError({
      statusCode: 404,
      statusMessage: "Policy not found",
    });
  }

  return {
    status: true,
    message: "Policy fetched successfully",
    data: policy[0],
  };
};

export const updatePolicyService = async (
  id: number,
  brokerId: number,
  body: IUpdatePolicyBody,
  document?: IMultipartFile
) => {
  const db = await connectDB();

  const existing = await db
    .select()
    .from(policies)
    .where(and(eq(policies.id, id), eq(policies.brokerId, brokerId)))
    .limit(1);

  if (!existing.length) {
    throw createError({
      statusCode: 404,
      statusMessage: "Policy not found",
    });
  }

  const currentPolicy = existing[0] as typeof policies.$inferSelect;

  const updateData: Partial<typeof policies.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.title !== undefined) {
    if (!body.title.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Title cannot be empty",
      });
    }
    updateData.title = body.title.trim();
  }

  if (body.description !== undefined) {
    updateData.description = body.description.trim() || null;
  }

  if (document) {
    if (document.type !== "application/pdf") {
      throw createError({
        statusCode: 400,
        statusMessage: "Only PDF files are allowed",
      });
    }

    const uploadResult = await uploadSingleFile(document, "policy_pdfs", "raw");

    if (!uploadResult.status || !uploadResult.data) {
      throw createError({
        statusCode: 400,
        statusMessage: uploadResult.message,
      });
    }

    updateData.documentUrl = uploadResult.data.url;
    updateData.documentPublicId = uploadResult.data.filename;

    if (currentPolicy.documentPublicId) {
      await deleteSingleFile({
        filename: currentPolicy.documentPublicId,
        resourceType: "raw",
      });
    }
  }

  if (Object.keys(updateData).length === 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid fields provided for update",
    });
  }

  const updated = await db
    .update(policies)
    .set(updateData)
    .where(and(eq(policies.id, id), eq(policies.brokerId, brokerId)))
    .returning();

  return {
    status: true,
    message: "Policy updated successfully",
    data: updated[0],
  };
};

export const deletePolicyService = async (id: number, brokerId: number) => {
  const db = await connectDB();

  const existing = await db
    .select()
    .from(policies)
    .where(and(eq(policies.id, id), eq(policies.brokerId, brokerId)))
    .limit(1);

  if (!existing.length) {
    throw createError({
      statusCode: 404,
      statusMessage: "Policy not found",
    });
  }

  const policy = existing[0] as typeof policies.$inferSelect;

  if (policy.documentPublicId) {
    await deleteSingleFile({
      filename: policy.documentPublicId,
      resourceType: "raw",
    });
  }

  await db
    .delete(policies)
    .where(and(eq(policies.id, id), eq(policies.brokerId, brokerId)));

  return {
    status: true,
    message: "Policy deleted successfully",
  };
};