
import jwt from "jsonwebtoken";
import { useRuntimeConfig } from "#imports";

export const verifyAccessToken = (
  token: string
) => {

  try {

    const config = useRuntimeConfig();

    return jwt.verify(
      token,
      config.jwtSecret
    );

  } catch (error) {
    return null;
  }
};