import { UserMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { UserRepository } from "../user.repository";

@UseCaseTelemetry
export class ListAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async exec() {
    return this.userRepository
      .list()
      .then((rows) => rows.map(UserMapper.toUser));
  }
}
