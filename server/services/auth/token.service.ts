
import jwt from "jsonwebtoken";
import { useRuntimeConfig } from "#imports";

export const createAccessToken = (
  payload: {
    id: number
  }
) => {

  const config = useRuntimeConfig();

  return jwt.sign(
    payload,
    config.jwtSecret,
    {
      expiresIn: "7d",
    }
  );
};