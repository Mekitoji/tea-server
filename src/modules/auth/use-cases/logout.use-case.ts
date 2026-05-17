import { AuthHelper } from "../libs";
import type { AuthSessionRepository } from "../auth-session.repository";

export class LogoutUseCase {
  constructor(private readonly authSessionRepository: AuthSessionRepository) {}

  async exec(refreshToken: string | null) {
    if (!refreshToken) {
      return { ok: true as const };
    }

    await this.authSessionRepository.revokeByRefreshTokenHash(
      await AuthHelper.hashToken(refreshToken),
    );

    return { ok: true as const };
  }
}
