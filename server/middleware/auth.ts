// server/middleware/auth.ts

import { defineEventHandler, getHeader, createError } from "h3";

import { eq } from "drizzle-orm";

import { connectDB } from "~~/server/config/db";
import { brokers } from "~~/server/models";

import { verifyAccessToken } from "~~/server/services/auth/verify.service";

const PUBLIC_ROUTES = [
  "/api/public",
  "/api/docusign/sign",
  "/api/docusign/webhook",
  "/api/docusign/success",
];

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;

  // ================= BYPASS =================

  const isPublicRoute = PUBLIC_ROUTES.some((route) => path.startsWith(route));

  if (isPublicRoute) {
    return;
  }

  console.log("Auth Middleware Triggered for Path:", path);
  // ================= AUTH HEADER =================

  const authorization = getHeader(event, "authorization");

  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // ================= TOKEN =================

  const token = authorization.split(" ")[1];

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Token missing",
    });
  }

  // ================= VERIFY TOKEN =================

  const decoded: any = verifyAccessToken(token);

  if (!decoded) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid token",
    });
  }

  // ================= DB =================

  const db = await connectDB();

  // ================= FIND BROKER =================

  const broker = await db.query.brokers.findFirst({
    where: eq(brokers.id, decoded.id),
  });

  if (!broker) {
    throw createError({
      statusCode: 401,
      statusMessage: "Broker not found",
    });
  }

  // ================= REMOVE PASSWORD =================

  const { password, ...safeBroker } = broker;

  // ================= CONTEXT =================

  event.context.broker = safeBroker;
});
