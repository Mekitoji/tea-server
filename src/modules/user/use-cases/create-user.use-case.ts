import { UserHelper, UserMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { UserRole } from "../types/user.model";
import type { UserRepository } from "../user.repository";

export interface CreateUserInput {
  email: string;
  displayName: string;
  role?: UserRole;
}

@UseCaseTelemetry
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async exec(input: CreateUserInput) {
    return this.userRepository
      .create({
        id: UserHelper.generateUserId(),
        email: input.email,
        displayName: input.displayName,
        role: input.role ?? "user",
      })
      .then(UserMapper.toUser);
  }
}
