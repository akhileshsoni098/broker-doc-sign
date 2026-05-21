
// server/services/policy/signingToken.service.ts

import jwt from "jsonwebtoken";

export interface ISigningTokenPayload {
  policyId: number;
  brokerId: number;
  customerName: string;
  customerEmail: string;
}

export const createSigningToken = (payload: ISigningTokenPayload) => {
  const config = useRuntimeConfig();

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: "7d",
  });
};

export const verifySigningToken = (token: string) => {
  const config = useRuntimeConfig();

  try {
    return jwt.verify(token, config.jwtSecret) as ISigningTokenPayload;
  } catch {
    return null;
  }
};