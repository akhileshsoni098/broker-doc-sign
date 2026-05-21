import { eq } from "drizzle-orm"
import { connectDB } from "~~/server/config/db"
import { policies } from "~~/server/models/policy/policy.model"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (body?.status === "completed" && body?.envelopeId) {
    const db = await connectDB()

    const [policy] = await db
      .select()
      .from(policies)
      .where(eq(policies.docusignEnvelopeId, body.envelopeId))
      .limit(1)

    if (policy && policy.status !== "signed") {
      await db
        .update(policies)
        .set({
          status: "signed",
          signedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(policies.id, policy.id))

      const { emitPolicySigned } = await import("~~/server/utils/notification")
      emitPolicySigned(policy.brokerId, policy.title)
    }
  }

  return { success: true }
})
