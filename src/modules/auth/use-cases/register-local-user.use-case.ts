import { ConflictError } from "../../../shared/errors";
import { UserHelper, UserMapper } from "../../user/libs";
import type { UserRepository } from "../../user/user.repository";
import type { AuthIdentityRepository } from "../auth-identity.repository";
import type { AuthSessionRepository } from "../auth-session.repository";
import { AuthHelper, AuthMapper } from "../libs";
import type { TransactionBuilder } from "kysely";
import type { DB } from "../../../db";

export interface RegisterLocalUserInput {
  email: string;
  displayName: string;
  password: string;
}

export class RegisterLocalUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authIdentityRepository: AuthIdentityRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(input: RegisterLocalUserInput) {
    const email = input.email.toLowerCase();
    const passwordHash = await Bun.password.hash(input.password);

    return this.transaction.execute(async (trx) => {
      const trxUserRepository = this.userRepository.withTransaction(trx);
      const trxAuthIdentityRepository =
        this.authIdentityRepository.withTransaction(trx);
      const trxAuthSessionRepository =
        this.authSessionRepository.withTransaction(trx);
      const existingUser = await trxUserRepository.findByEmail(email);

      if (existingUser) {
        throw new ConflictError("User already exists");
      }

      const user = await trxUserRepository.create({
        id: UserHelper.generateUserId(),
        email,
        displayName: input.displayName,
        role: "user",
      });

      await trxAuthIdentityRepository.create({
        id: AuthHelper.generateIdentityId(),
        userId: user.id,
        provider: "local",
        providerSubject: email,
        email,
        passwordHash,
      });

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
