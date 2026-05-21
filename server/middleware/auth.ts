import { jwtVerify } from "jose"
import { eq } from "drizzle-orm"
import { connectDB } from "~~/server/config/db"
import { brokers } from "~~/server/models/broker/broker.model"
import type { IBrokerJwt } from "~~/server/types/brokerProfileTypes"

export default defineEventHandler(async (event) => {
  const publicPaths = [
    "/api/public/",
    "/api/index.post",
    "/api/login.post",
    "/api/register.post",
  ]

  const path = event.path || getRequestURL(event).pathname
  if (publicPaths.some((p) => path.startsWith(p))) return

  const authHeader = getHeader(event, "authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, message: "Unauthorized" })
  }

  const token = authHeader.slice(7)
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)

  try {
    const { payload } = await jwtVerify(token, secret)
    const jwt = payload as unknown as IBrokerJwt

    const db = await connectDB()
    const [broker] = await db
      .select({ id: brokers.id, name: brokers.name, email: brokers.email, role: brokers.role })
      .from(brokers)
      .where(eq(brokers.id, jwt.id))
      .limit(1)

    if (!broker) {
      throw createError({ statusCode: 401, message: "Broker not found" })
    }

    event.context.broker = broker
  } catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 401, message: "Invalid token" })
  }
})
