import type { User } from "../../user/types/user.model";

export type AuthProvider = "local" | "google";

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthResult {
  user: User;
  session: AuthSession;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
}

export interface GoogleTokenInfo {
  sub: string;
  email: string;
  email_verified?: "true" | "false" | boolean;
  name?: string;
  aud?: string;
}
