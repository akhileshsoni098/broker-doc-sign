import { SignJWT } from "jose"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { connectDB } from "~~/server/config/db"
import { brokers } from "~~/server/models/broker/broker.model"

export async function brokerRegisterService(body: { name: string; email: string; password: string }) {
  const db = await connectDB()

  const [existing] = await db
    .select({ id: brokers.id })
    .from(brokers)
    .where(eq(brokers.email, body.email))
    .limit(1)

  if (existing) {
    throw createError({ statusCode: 409, message: "Email already registered" })
  }

  const hashed = await bcrypt.hash(body.password, 10)

  const [broker] = await db
    .insert(brokers)
    .values({ name: body.name, email: body.email, password: hashed })
    .returning({ id: brokers.id, name: brokers.name, email: brokers.email, role: brokers.role })

  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)
  const token = await new SignJWT({ id: broker.id, name: broker.name, email: broker.email, role: broker.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)

  return { token, broker }
}

export async function brokerLoginService(body: { email: string; password: string }) {
  const db = await connectDB()

  const [user] = await db
    .select()
    .from(brokers)
    .where(eq(brokers.email, body.email))
    .limit(1)

  if (!user) {
    throw createError({ statusCode: 401, message: "Invalid email or password" })
  }

  const valid = await bcrypt.compare(body.password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, message: "Invalid email or password" })
  }

  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)
  const token = await new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)

  return { token, broker: { id: user.id, name: user.name, email: user.email, role: user.role } }
}
