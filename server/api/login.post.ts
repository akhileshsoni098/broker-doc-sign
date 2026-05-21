import { brokerLoginService } from "~~/server/services/user/auth.service"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return brokerLoginService(body)
})
