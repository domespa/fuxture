import jwt from "jsonwebtoken";
import { env } from "../config/env";

const JWT_EXPIRES_IN = "7d";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("TOKEN NON VALIDO O SCADUTO");
  }
};
