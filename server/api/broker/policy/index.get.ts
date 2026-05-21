import { getPoliciesService } from "~~/server/services/policy/policy.service"

export default defineEventHandler(async (event) => {
  const broker = event.context.broker
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10

  return getPoliciesService(broker.id, page, limit)
})
