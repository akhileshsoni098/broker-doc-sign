import { eq } from "drizzle-orm"
import { connectDB } from "~~/server/config/db"
import { policies } from "~~/server/models/policy/policy.model"

export async function startSigningService(policyId: string) {
  const db = await connectDB()

  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.id, policyId))
    .limit(1)

  if (!policy) {
    throw createError({ statusCode: 404, message: "Policy not found" })
  }

  if (!policy.documentUrl) {
    throw createError({ statusCode: 400, message: "No document uploaded for this policy" })
  }

  if (policy.status === "signed") {
    throw createError({ statusCode: 400, message: "Policy already signed" })
  }

  if (policy.signingToken) {
    const config = useRuntimeConfig()
    return { signingUrl: `${config.public.appUrl}/sign/${policy.signingToken}` }
  }

  try {
    const { dsApi, makeEnvelope } = await import("~~/server/services/docusign/docusign.service")
    const config = useRuntimeConfig()
    const envelope = makeEnvelope(
      policy.documentUrl,
      policy.title,
      `${config.public.appUrl}/api/public/signed/${policy.signingToken || policy.id}`
    )
    const results = await dsApi.createEnvelope(config.docusignAccountId!, { envelopeDefinition: envelope })
    const envelopeId = results.envelopeId

    await db
      .update(policies)
      .set({
        docusignEnvelopeId: envelopeId,
        signingToken: policy.signingToken,
      })
      .where(eq(policies.id, policyId))

    let signingUrl = ""
    if (results?.recipients?.signers?.[0]?.recipientIdGuid) {
      signingUrl = `${config.docusignBasePath}/signing/${results.recipients.signers[0].recipientIdGuid}`
    }

    return { signingUrl: signingUrl || `${config.public.appUrl}/sign/${policy.signingToken}` }
  } catch (e: any) {
    console.error("DocuSign error:", e)
    return { signingUrl: `${useRuntimeConfig().public.appUrl}/sign/${policy.signingToken}` }
  }
}
