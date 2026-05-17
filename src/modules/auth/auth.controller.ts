import type { Context } from "elysia";
import type { RefreshTokenInput } from "./use-cases/refresh-token.use-case";
import type { RegisterLocalUserInput } from "./use-cases/register-local-user.use-case";
import type { SignInGoogleUserInput } from "./use-cases/sign-in-google-user.use-case";
import type { SignInLocalUserInput } from "./use-cases/sign-in-local-user.use-case";
import { AuthHelper } from "./libs";
import type { AuthUseCases, AuthUseCasesTransactionFactory } from "./use-cases";

type ResponseSet = Context["set"];

interface AuthRequest<TBody = unknown> {
  body: TBody;
  set: ResponseSet;
}

interface TokenRequest {
  headers: Record<string, string | undefined>;
}

interface LogoutInput {
  refreshToken?: string;
}

export class AuthController {
  constructor(
    private readonly useCases: AuthUseCases,
    private readonly useCasesFactory: AuthUseCasesTransactionFactory,
  ) {}

  async registerLocal({
    body,
    set,
  }: AuthRequest<RegisterLocalUserInput>) {
    const authResult =
      await this.useCasesFactory.createRegisterLocalUser().exec(body);
    set.status = 201;

    return authResult;
  }

  async signInLocal({ body }: AuthRequest<SignInLocalUserInput>) {
    return this.useCases.SignInLocalUser.exec(body);
  }

  async signInGoogle({ body }: AuthRequest<SignInGoogleUserInput>) {
    return this.useCasesFactory.createSignInGoogleUser().exec(body);
  }

  async refresh({ body }: AuthRequest<RefreshTokenInput>) {
    return this.useCasesFactory.createRefreshToken().exec(body);
  }

  async me({ headers }: TokenRequest) {
    return this.useCases.GetCurrentUser.exec(
      AuthHelper.readBearerToken(headers.authorization),
    );
  }

  async logout({ body }: AuthRequest<LogoutInput>) {
    return this.useCases.Logout.exec(body.refreshToken ?? null);
  }
}
