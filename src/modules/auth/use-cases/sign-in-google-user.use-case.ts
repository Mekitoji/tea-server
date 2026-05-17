import { UserHelper, UserMapper } from "../../user/libs";
import type { UserRepository } from "../../user/user.repository";
import { UnauthorizedError } from "../../../shared/errors";
import type { AuthIdentityRepository } from "../auth-identity.repository";
import type { AuthSessionRepository } from "../auth-session.repository";
import { AuthHelper, AuthMapper, GoogleTokenVerifier } from "../libs";
import type { TransactionBuilder } from "kysely";
import type { DB } from "../../../db";

export interface SignInGoogleUserInput {
  idToken: string;
}

export class SignInGoogleUserUseCase {
  private readonly googleTokenVerifier = new GoogleTokenVerifier();

  constructor(
    private readonly userRepository: UserRepository,
    private readonly authIdentityRepository: AuthIdentityRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(input: SignInGoogleUserInput) {
    const tokenInfo = await this.googleTokenVerifier.verify(input.idToken);
    const email = tokenInfo.email.toLowerCase();

    return this.transaction.execute(async (trx) => {
      const trxUserRepository = this.userRepository.withTransaction(trx);
      const trxAuthIdentityRepository =
        this.authIdentityRepository.withTransaction(trx);
      const trxAuthSessionRepository =
        this.authSessionRepository.withTransaction(trx);
      const identity = await trxAuthIdentityRepository.findByProviderSubject(
        "google",
        tokenInfo.sub,
      );
      const user =
        identity
          ? await trxUserRepository.findById(identity.user_id)
          : await this.findOrCreateUser(trxUserRepository, {
              id: UserHelper.generateUserId(),
              email,
              displayName: tokenInfo.name ?? email,
            });

      if (!user) {
        throw new UnauthorizedError("Google identity is not linked to a user");
      }

      if (!identity) {
        await trxAuthIdentityRepository.create({
          id: AuthHelper.generateIdentityId(),
          userId: user.id,
          provider: "google",
          providerSubject: tokenInfo.sub,
          email,
        });
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

  private async findOrCreateUser(
    userRepository: UserRepository,
    input: {
      id: string;
      email: string;
      displayName: string;
    },
  ) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      return existingUser;
    }

    return userRepository.create({
      id: input.id,
      email: input.email,
      displayName: input.displayName,
      role: "user",
    });
  }
}
