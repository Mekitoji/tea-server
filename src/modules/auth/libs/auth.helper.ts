import { UnauthorizedError } from "../../../shared/errors";
import { generateRandomId } from "../../../shared/id";
import type { UserRow } from "../../../db";
import type { AccessTokenClaims } from "../types/auth.model";

const base64UrlEncode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const base64UrlDecode = <T>(value: string): T =>
  JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;

export class AuthHelper {
  static generateIdentityId = () => generateRandomId("aid");

  static generateSessionId = () => generateRandomId("ase");

  static readBearerToken = (authorization?: string) => {
    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    return authorization.slice("Bearer ".length).trim();
  };

  static generateToken = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);

    return Buffer.from(bytes).toString("base64url");
  };

  static hashToken = async (token: string) => {
    const input = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest("SHA-256", input);

    return Buffer.from(digest).toString("base64url");
  };

  static sessionExpiresAt = () => {
    const days = Number(Bun.env.AUTH_REFRESH_DAYS ?? 30);
    const durationMs = Number.isFinite(days) ? days * 24 * 60 * 60 * 1000 : 0;

    return new Date(Date.now() + durationMs);
  };

  static accessTokenExpiresAt = () => {
    const minutes = Number(Bun.env.AUTH_ACCESS_MINUTES ?? 15);
    const durationMs = Number.isFinite(minutes) ? minutes * 60 * 1000 : 0;

    return new Date(Date.now() + durationMs);
  };

  static createAccessToken = async (user: UserRow) => {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = Math.floor(AuthHelper.accessTokenExpiresAt().getTime() / 1000);
    const header = {
      alg: "HS256",
      typ: "JWT",
    };
    const claims: AccessTokenClaims = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: expiresAt,
    };
    const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(claims)}`;
    const signature = await AuthHelper.signJwt(unsignedToken);

    return `${unsignedToken}.${signature}`;
  };

  static verifyAccessToken = async (token: string) => {
    const [encodedHeader, encodedClaims, signature] = token.split(".");

    if (!encodedHeader || !encodedClaims || !signature) {
      throw new UnauthorizedError();
    }

    const unsignedToken = `${encodedHeader}.${encodedClaims}`;
    const expectedSignature = await AuthHelper.signJwt(unsignedToken);

    if (signature !== expectedSignature) {
      throw new UnauthorizedError();
    }

    let claims: AccessTokenClaims;

    try {
      claims = base64UrlDecode<AccessTokenClaims>(encodedClaims);
    } catch {
      throw new UnauthorizedError();
    }

    if (!claims.sub || !claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedError();
    }

    return claims;
  };

  private static signJwt = async (value: string) => {
    const secret = Bun.env.JWT_SECRET ?? Bun.env.AUTH_JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is required to sign access tokens");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(value),
    );

    return Buffer.from(signature).toString("base64url");
  };
}
