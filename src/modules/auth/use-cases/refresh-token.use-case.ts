import { UnauthorizedError } from "../../../shared/errors";
import { UserMapper } from "../../user/libs";
import type { UserRepository } from "../../user/user.repository";
import type { AuthSessionRepository } from "../auth-session.repository";
import { AuthHelper, AuthMapper } from "../libs";
import type { TransactionBuilder } from "kysely";
import type { DB } from "../../../db";

export interface RefreshTokenInput {
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(input: RefreshTokenInput) {
    const currentRefreshTokenHash = await AuthHelper.hashToken(
      input.refreshToken,
    );

    return this.transaction.execute(async (trx) => {
      const trxUserRepository = this.userRepository.withTransaction(trx);
      const trxAuthSessionRepository =
        this.authSessionRepository.withTransaction(trx);
      const activeSession =
        await trxAuthSessionRepository.findActiveByRefreshTokenHash(
          currentRefreshTokenHash,
        );

      if (!activeSession) {
        throw new UnauthorizedError();
      }

      await trxAuthSessionRepository.revokeByRefreshTokenHash(
        currentRefreshTokenHash,
      );

      const user = await trxUserRepository.findById(activeSession.user_id);

      if (!user) {
        throw new UnauthorizedError();
      }

      const refreshToken = AuthHelper.generateToken();
      const session = await trxAuthSessionRepository.create({
        id: AuthHelper.generateSessionId(),
        userId: user.id,
        refreshTokenHash: await AuthHelper.hashToken(refreshToken),
        expiresAt: AuthHelper.sessionExpiresAt(),
      });

      return {
        user: UserMapper.toUser(user),
        session: AuthMapper.toSession(session),
        accessToken: await AuthHelper.createAccessToken(user),
        refreshToken,
        tokenType: "Bearer" as const,
      };
    });
  }
}
