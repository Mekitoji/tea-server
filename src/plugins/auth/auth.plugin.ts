import { Elysia } from "elysia";

import type { AppDb } from "../../db";
import { AuthHelper } from "../../modules/auth/libs";
import { UserMapper } from "../../modules/user/libs";
import { UserRepository } from "../../modules/user/user.repository";
import type { User } from "../../modules/user/types/user.model";
import { ForbiddenError, UnauthorizedError } from "../../shared/errors";

interface AuthContext extends Record<string, unknown> {
  currentUser: User | null;
}

export const createAuthPlugin = (db: AppDb) => {
  const userRepository = new UserRepository(db);

  return new Elysia().derive(async ({ headers }): Promise<AuthContext> => {
    const token = AuthHelper.readBearerToken(headers.authorization);

    if (!token) {
      return { currentUser: null };
    }

    const claims = await AuthHelper.verifyAccessToken(token);
    const user = await userRepository.findById(claims.sub);

    return {
      currentUser: user ? UserMapper.toUser(user) : null,
    };
  });
};

export const requireAuth = (context: any) => {
  if (!context.currentUser) {
    throw new UnauthorizedError();
  }
};

export const requireAdmin = (context: any) => {
  if (!context.currentUser) {
    throw new UnauthorizedError();
  }

  if (context.currentUser.role !== "admin") {
    throw new ForbiddenError();
  }
};
