import { eq } from "drizzle-orm"
import { connectDB } from "~~/server/config/db"
import { policies } from "~~/server/models/policy/policy.model"

export async function fetchSigningPolicyService(token: string) {
  const db = await connectDB()

  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.signingToken, token))
    .limit(1)

  if (!policy) {
    throw createError({ statusCode: 404, message: "Invalid signing link" })
  }

  return { success: true, policy: { ...policy, brokerId: undefined } }
}
