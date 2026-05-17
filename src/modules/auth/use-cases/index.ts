import { GetCurrentUserUseCase } from "./get-current-user.use-case";
import { LogoutUseCase } from "./logout.use-case";
import { RefreshTokenUseCase } from "./refresh-token.use-case";
import { RegisterLocalUserUseCase } from "./register-local-user.use-case";
import { SignInGoogleUserUseCase } from "./sign-in-google-user.use-case";
import { SignInLocalUserUseCase } from "./sign-in-local-user.use-case";
import type { DB } from "../../../db";
import type { UserRepository } from "../../user/user.repository";
import type { AuthIdentityRepository } from "../auth-identity.repository";
import type { AuthSessionRepository } from "../auth-session.repository";
import type { TransactionBuilder } from "kysely";

export interface AuthUseCases {
  GetCurrentUser: GetCurrentUserUseCase;
  Logout: LogoutUseCase;
  SignInLocalUser: SignInLocalUserUseCase;
}

export interface AuthUseCasesTransactionFactory {
  createRefreshToken(): RefreshTokenUseCase;
  createRegisterLocalUser(): RegisterLocalUserUseCase;
  createSignInGoogleUser(): SignInGoogleUserUseCase;
}

export const createAuthUseCases = (
  userRepository: UserRepository,
  authIdentityRepository: AuthIdentityRepository,
  authSessionRepository: AuthSessionRepository,
): AuthUseCases => ({
  GetCurrentUser: new GetCurrentUserUseCase(userRepository),
  Logout: new LogoutUseCase(authSessionRepository),
  SignInLocalUser: new SignInLocalUserUseCase(
    userRepository,
    authIdentityRepository,
    authSessionRepository,
  ),
});

export class AuthUseCaseFactory implements AuthUseCasesTransactionFactory {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authIdentityRepository: AuthIdentityRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly transaction: () => TransactionBuilder<DB>,
  ) {}

  createRefreshToken() {
    return new RefreshTokenUseCase(
      this.userRepository,
      this.authSessionRepository,
      this.transaction(),
    );
  }

  createRegisterLocalUser() {
    return new RegisterLocalUserUseCase(
      this.userRepository,
      this.authIdentityRepository,
      this.authSessionRepository,
      this.transaction(),
    );
  }

  createSignInGoogleUser() {
    return new SignInGoogleUserUseCase(
      this.userRepository,
      this.authIdentityRepository,
      this.authSessionRepository,
      this.transaction(),
    );
  }
}
