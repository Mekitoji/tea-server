import { UnauthorizedError } from "../../../shared/errors";
import type { GoogleTokenInfo } from "../types/auth.model";

export class GoogleTokenVerifier {
  async verify(idToken: string): Promise<GoogleTokenInfo> {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        idToken,
      )}`,
    );

    if (!response.ok) {
      throw new UnauthorizedError("Invalid Google token");
    }

    const tokenInfo = (await response.json()) as GoogleTokenInfo;
    const clientId = Bun.env.GOOGLE_CLIENT_ID;

    if (clientId && tokenInfo.aud !== clientId) {
      throw new UnauthorizedError("Google token audience mismatch");
    }

    if (tokenInfo.email_verified === false || tokenInfo.email_verified === "false") {
      throw new UnauthorizedError("Google email is not verified");
    }

    if (!tokenInfo.sub || !tokenInfo.email) {
      throw new UnauthorizedError("Google token is missing required claims");
    }

    return tokenInfo;
  }
}
