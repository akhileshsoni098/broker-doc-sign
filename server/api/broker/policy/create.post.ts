import { createPolicyService } from "~~/server/services/policy/policy.service"

export default defineEventHandler(async (event) => {
  const broker = event.context.broker
  const parts = await readMultipartFormData(event) || []

  let title = ""
  let description = ""
  let fileBuffer: Buffer | null = null

  for (const part of parts) {
    if (part.name === "title") title = part.data.toString()
    else if (part.name === "description") description = part.data.toString()
    else if (part.name === "document" && part.data.length > 0) fileBuffer = part.data
  }

  if (!title) throw createError({ statusCode: 400, message: "Title is required" })

  return createPolicyService(broker.id, { title, description: description || undefined }, fileBuffer)
})
