import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

// generation d un token JWT signe avec le secret et la duree configuree
const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as jwt.SignOptions);
};

// verification et decodage d un token JWT, retourne null si invalide ou expire
const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};

// extraction du TTL restant d un token en secondes pour la blacklist Redis
const getTokenRemainingTTL = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded?.exp) return 0;
    const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);
    return remainingSeconds > 0 ? remainingSeconds : 0;
  } catch {
    return 0;
  }
};

export default {
  generateToken,
  verifyToken,
  getTokenRemainingTTL,
};