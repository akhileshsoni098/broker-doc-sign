import { signedPolicyByCustomerService } from "~~/server/services/publicSignedPolicyCustomer/signedPolicyByCustomer.service"

export default defineEventHandler(async (event) => {
  const token = event.context.params!.token
  const parts = await readMultipartFormData(event) || []
  const signedFilePart = parts.find((p) => p.name === "signedFile")

  if (!signedFilePart || !signedFilePart.data.length) {
    throw createError({ statusCode: 400, message: "No signed file provided" })
  }

  return signedPolicyByCustomerService(token, signedFilePart.data)
})
