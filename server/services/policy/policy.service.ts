import { eq, sql, and, desc } from "drizzle-orm"
import { connectDB } from "~~/server/config/db"
import { policies } from "~~/server/models/policy/policy.model"

export async function createPolicyService(
  brokerId: string,
  body: { title: string; description?: string },
  fileBuffer?: Buffer | null
) {
  const db = await connectDB()
  let documentUrl: string | null = null
  let documentPublicId: string | null = null

  if (fileBuffer) {
    const { uploadDocument } = await import("~~/server/utils/cloudinary")
    const result = await uploadDocument(fileBuffer)
    documentUrl = result.url
    documentPublicId = result.publicId
  }

  const [policy] = await db
    .insert(policies)
    .values({
      title: body.title,
      description: body.description || null,
      documentUrl,
      documentPublicId,
      brokerId,
    })
    .returning()

  return { policy }
}

export async function getPoliciesService(brokerId: string, page = 1, limit = 10) {
  const db = await connectDB()
  const offset = (page - 1) * limit

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(policies)
      .where(eq(policies.brokerId, brokerId))
      .orderBy(desc(policies.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(policies)
      .where(eq(policies.brokerId, brokerId)),
  ])

  return { policies: rows, pagination: { total: Number(count), page, limit } }
}

export async function getPolicyService(brokerId: string, policyId: string) {
  const db = await connectDB()
  const [policy] = await db
    .select()
    .from(policies)
    .where(and(eq(policies.id, policyId), eq(policies.brokerId, brokerId)))
    .limit(1)

  if (!policy) throw createError({ statusCode: 404, message: "Policy not found" })
  return { policy }
}

export async function updatePolicyService(
  brokerId: string,
  policyId: string,
  body: { title?: string; description?: string },
  fileBuffer?: Buffer | null
) {
  const db = await connectDB()

  const [existing] = await db
    .select()
    .from(policies)
    .where(and(eq(policies.id, policyId), eq(policies.brokerId, brokerId)))
    .limit(1)

  if (!existing) throw createError({ statusCode: 404, message: "Policy not found" })

  const updateData: Record<string, any> = {}
  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description

  if (fileBuffer) {
    if (existing.documentPublicId) {
      const { deleteDocument } = await import("~~/server/utils/cloudinary")
      await deleteDocument(existing.documentPublicId).catch(() => {})
    }
    const { uploadDocument } = await import("~~/server/utils/cloudinary")
    const result = await uploadDocument(fileBuffer)
    updateData.documentUrl = result.url
    updateData.documentPublicId = result.publicId
  }

  if (Object.keys(updateData).length > 0) {
    updateData.updatedAt = sql`now()`
  }

  const [policy] = await db
    .update(policies)
    .set(updateData)
    .where(eq(policies.id, policyId))
    .returning()

  return { policy }
}

export async function deletePolicyService(brokerId: string, policyId: string) {
  const db = await connectDB()
  const [existing] = await db
    .select()
    .from(policies)
    .where(and(eq(policies.id, policyId), eq(policies.brokerId, brokerId)))
    .limit(1)

  if (!existing) throw createError({ statusCode: 404, message: "Policy not found" })

  if (existing.documentPublicId) {
    const { deleteDocument } = await import("~~/server/utils/cloudinary")
    await deleteDocument(existing.documentPublicId).catch(() => {})
  }

  await db.delete(policies).where(eq(policies.id, policyId))
  return { message: "Policy deleted" }
}
