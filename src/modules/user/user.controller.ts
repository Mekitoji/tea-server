import type { Context } from "elysia";
import { NotFoundError } from "../../shared/errors";
import type { CreateUserInput } from "./use-cases/create-user.use-case";
import type { UserUseCases } from "./use-cases";

type ResponseSet = Context["set"];

interface CreateUserRequest {
  body: CreateUserInput;
  set: ResponseSet;
}

interface FindUserByIdRequest {
  params: {
    id: string;
  };
}

export class UserController {
  constructor(private readonly useCases: UserUseCases) {}

  async listUsers() {
    return this.useCases.ListAllUsers.exec();
  }

  async createUser({ body, set }: CreateUserRequest) {
    const user = await this.useCases.CreateUser.exec(body);
    set.status = 201;

    return user;
  }

  async findUserById({ params }: FindUserByIdRequest) {
    const user = await this.useCases.FindUserById.exec(params.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
