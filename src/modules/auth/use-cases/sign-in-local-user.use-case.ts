import { UnauthorizedError } from "../../../shared/errors";
import { UserMapper } from "../../user/libs";
import type { UserRepository } from "../../user/user.repository";
import type { AuthIdentityRepository } from "../auth-identity.repository";
import type { AuthSessionRepository } from "../auth-session.repository";
import { AuthHelper, AuthMapper } from "../libs";

export interface SignInLocalUserInput {
  email: string;
  password: string;
}

export class SignInLocalUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authIdentityRepository: AuthIdentityRepository,
    private readonly authSessionRepository: AuthSessionRepository,
  ) {}

  async exec(input: SignInLocalUserInput) {
    const email = input.email.toLowerCase();
    const identity = await this.authIdentityRepository.findLocalByEmail(email);

    if (!identity?.password_hash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const validPassword = await Bun.password.verify(
      input.password,
      identity.password_hash,
    );

    if (!validPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const refreshToken = AuthHelper.generateToken();
    const session = await this.authSessionRepository.create({
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
  }
}
