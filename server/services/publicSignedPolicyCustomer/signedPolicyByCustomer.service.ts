import { eq } from "drizzle-orm"
import { connectDB } from "~~/server/config/db"
import { policies } from "~~/server/models/policy/policy.model"

export async function signedPolicyByCustomerService(token: string, signedFileBuffer: Buffer) {
  const db = await connectDB()

  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.signingToken, token))
    .limit(1)

  if (!policy) throw createError({ statusCode: 404, message: "Invalid signing link" })
  if (policy.status === "signed") throw createError({ statusCode: 400, message: "Document already signed" })

  const { uploadDocument } = await import("~~/server/utils/cloudinary")
  const result = await uploadDocument(signedFileBuffer)

  await db
    .update(policies)
    .set({
      status: "signed",
      signedPdfUrl: result.url,
      signedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(policies.id, policy.id))

  const { emitPolicySigned } = await import("~~/server/utils/notification")
  emitPolicySigned(policy.brokerId, policy.title)

  return { success: true, message: "Document signed successfully" }
}
