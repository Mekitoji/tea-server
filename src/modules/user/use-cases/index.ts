import { ListAllUsersUseCase } from "./list-all-users.use-case";
import { FindUserByIdUseCase } from "./find-user-by-id.use-case";
import { CreateUserUseCase } from "./create-user.use-case";
import type { UserRepository } from "../user.repository";

export interface UserUseCases {
  ListAllUsers: ListAllUsersUseCase;
  FindUserById: FindUserByIdUseCase;
  CreateUser: CreateUserUseCase;
}

export const createUserUseCases = (repository: UserRepository): UserUseCases => {
  const listAllUsersUseCase = new ListAllUsersUseCase(repository);
  const findUserByIdUseCase = new FindUserByIdUseCase(repository);
  const createUserUseCase = new CreateUserUseCase(repository);

  return {
    ListAllUsers: listAllUsersUseCase,
    FindUserById: findUserByIdUseCase,
    CreateUser: createUserUseCase,
  };
};
