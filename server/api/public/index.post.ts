
import {
  defineEventHandler,
  readBody,
  createError,
} from "h3";

import { eq } from "drizzle-orm";

import bcrypt from "bcryptjs";

import { brokers } from "~~/server/models";

import { connectDB } from "~~/server/config/db";

import { createAccessToken } from "~~/server/services/auth/token.service";

import type { IBroker, IBrokerAuthBody } from "~~/server/types/broker.types";

export default defineEventHandler(
  async (event) => {

    try {

      // ================= DB =================

      const db = await connectDB();

      // ================= BODY =================

      const body = await readBody(event) as IBrokerAuthBody;

      const {
        type,
        name,
        email,
        password,
      } = body;

      // ================= VALIDATION =================

      if (!type) {
        throw createError({
          statusCode: 400,
          statusMessage:
            "Type is required",
        });
      }

      if (!email) {
        throw createError({
          statusCode: 400,
          statusMessage:
            "Email is required",
        });
      }

      if (!password) {
        throw createError({
          statusCode: 400,
          statusMessage:
            "Password is required",
        });
      }

      // ================= FIND BROKER =================

      const existingBroker =
        await db.query.brokers.findFirst({
          where: eq(
            brokers.email,
            email
          ),
        });

      // ==================================================
      // REGISTER
      // ==================================================

      if (type === "register") {

        // ================= NAME VALIDATION =================

        if (!name) {
          throw createError({
            statusCode: 400,
            statusMessage:
              "Name is required",
          });
        }

        // ================= EMAIL EXISTS =================

        if (existingBroker) {
          throw createError({
            statusCode: 409,
            statusMessage:
              "Broker already exists",
          });
        }

        // ================= HASH PASSWORD =================

        const hashedPassword =
          await bcrypt.hash(
            password,
            10
          );

        // ================= CREATE BROKER =================

        const insertedBroker =
          await db
            .insert(brokers)
            .values({
              name,
              email,
              password:
                hashedPassword,
            })
            .returning();

        const broker =
          insertedBroker[0] as IBroker;

        // ================= TOKEN =================

        const token =
          createAccessToken({
            id: broker.id,
          });

        // ================= REMOVE PASSWORD =================

        const {
          password: _password,
          ...safeBroker
        } = broker;

        // ================= RESPONSE =================

        return {
          status: true,

          message:
            "Register successful",

          token,

          data: safeBroker,
        };
      }

      // ==================================================
      // LOGIN
      // ==================================================

      if (type === "login") {

        // ================= USER CHECK =================

        if (!existingBroker) {
          throw createError({
            statusCode: 404,
            statusMessage:
              "Broker not found",
          });
        }

        // ================= PASSWORD CHECK =================

        const isPasswordValid =
          await bcrypt.compare(
            password,
            existingBroker.password
          );

        if (!isPasswordValid) {
          throw createError({
            statusCode: 401,
            statusMessage:
              "Invalid credentials",
          });
        }

        // ================= TOKEN =================

        const token =
          createAccessToken({
            id: existingBroker.id,
          });

        // ================= REMOVE PASSWORD =================

        const {
          password: _password,
          ...safeBroker
        } = existingBroker;

        // ================= RESPONSE =================

        return {
          status: true,

          message:
            "Login successful",

          token,

          data: safeBroker,
        };
      }

      // ==================================================
      // INVALID TYPE
      // ==================================================

      throw createError({
        statusCode: 400,
        statusMessage:
          "Invalid type",
      });

    } catch (error: any) {

      return {
        status: false,

        message:
          error.statusMessage ||
          error.message ||
          "Something went wrong",
      };
    }
  }
);