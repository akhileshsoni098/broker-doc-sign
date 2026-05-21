import { updatePolicyService } from "~~/server/services/policy/policy.service"

export default defineEventHandler(async (event) => {
  const broker = event.context.broker
  const policyId = event.context.params!.id
  const parts = await readMultipartFormData(event) || []

  let title: string | undefined
  let description: string | undefined
  let fileBuffer: Buffer | null = null

  for (const part of parts) {
    if (part.name === "title") title = part.data.toString()
    else if (part.name === "description") description = part.data.toString()
    else if (part.name === "document" && part.data.length > 0) fileBuffer = part.data
  }

  return updatePolicyService(broker.id, policyId, { title, description }, fileBuffer)
})
