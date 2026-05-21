import { getPolicyService } from "~~/server/services/policy/policy.service"

export default defineEventHandler(async (event) => {
  const broker = event.context.broker
  const policyId = event.context.params!.id

  return getPolicyService(broker.id, policyId)
})
