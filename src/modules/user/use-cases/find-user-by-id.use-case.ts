import { UserMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { UserRepository } from "../user.repository";

@UseCaseTelemetry
export class FindUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async exec(id: string) {
    return this.userRepository
      .findById(id)
      .then((row) => (row ? UserMapper.toUser(row) : null));
  }
}
