import { fetchSigningPolicyService } from "~~/server/services/publicSignedPolicyCustomer/fetchSigningPolicy.service"

export default defineEventHandler(async (event) => {
  const token = event.context.params!.token
  return fetchSigningPolicyService(token)
})
