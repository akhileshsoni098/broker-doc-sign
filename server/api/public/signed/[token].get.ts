import { eq } from "drizzle-orm"
import { connectDB } from "~~/server/config/db"
import { policies } from "~~/server/models/policy/policy.model"

export default defineEventHandler(async (event) => {
  const token = event.context.params!.token
  const query = getQuery(event)
  const db = await connectDB()

  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.signingToken, token))
    .limit(1)

  if (!policy) {
    throw createError({ statusCode: 404, message: "Invalid signing link" })
  }

  if (query.event === "signing_complete" || query.status === "completed") {
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

    const config = useRuntimeConfig()
    return sendRedirect(
      event,
      `${config.public.appUrl}/sign/${token}?status=completed&url=${encodeURIComponent(policy.signedPdfUrl || "")}`
    )
  }

  return { policy, message: "Document signed" }
})
