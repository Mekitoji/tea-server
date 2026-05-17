import { UnauthorizedError } from "../../../shared/errors";
import { UserMapper } from "../../user/libs";
import type { UserRepository } from "../../user/user.repository";
import { AuthHelper } from "../libs";

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async exec(accessToken: string | null) {
    if (!accessToken) {
      throw new UnauthorizedError();
    }

    const claims = await AuthHelper.verifyAccessToken(accessToken);
    const user = await this.userRepository.findById(claims.sub);

    if (!user) {
      throw new UnauthorizedError();
    }

    return UserMapper.toUser(user);
  }
}
