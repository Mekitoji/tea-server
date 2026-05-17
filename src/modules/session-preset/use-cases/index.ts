import { CreateUserSessionPresetUseCase } from "./create-user-session-preset.use-case";
import { DeleteUserSessionPresetUseCase } from "./delete-user-session-preset.use-case";
import { ListDefaultSessionPresetsUseCase } from "./list-default-session-presets.use-case";
import { ListUserSessionPresetsUseCase } from "./list-user-session-presets.use-case";
import type { DB } from "../../../db";
import type { DefaultPresetRepository } from "../repositories/default-preset.repository";
import type { UserPresetRepository } from "../repositories/user-preset.repository";
import type { TransactionBuilder } from "kysely";

export interface SessionPresetUseCases {
  ListDefaultSessionPresets: ListDefaultSessionPresetsUseCase;
  ListUserSessionPresets: ListUserSessionPresetsUseCase;
}

export interface SessionPresetUseCasesTransactionFactory {
  createCreateUserSessionPreset(): CreateUserSessionPresetUseCase;
  createDeleteUserSessionPreset(): DeleteUserSessionPresetUseCase;
}

export const createSessionPresetUseCases = (
  defaultPresetRepository: DefaultPresetRepository,
  userPresetRepository: UserPresetRepository,
): SessionPresetUseCases => {
  const listDefaultSessionPresetsUseCase = new ListDefaultSessionPresetsUseCase(
    defaultPresetRepository,
  );
  const listUserSessionPresetsUseCase = new ListUserSessionPresetsUseCase(
    userPresetRepository,
  );

  return {
    ListDefaultSessionPresets: listDefaultSessionPresetsUseCase,
    ListUserSessionPresets: listUserSessionPresetsUseCase,
  };
};

export class SessionPresetUseCaseFactory
  implements SessionPresetUseCasesTransactionFactory
{
  constructor(
    private readonly userPresetRepository: UserPresetRepository,
    private readonly transaction: () => TransactionBuilder<DB>,
  ) {}

  createCreateUserSessionPreset() {
    return new CreateUserSessionPresetUseCase(
      this.userPresetRepository,
      this.transaction(),
    );
  }

  createDeleteUserSessionPreset() {
    return new DeleteUserSessionPresetUseCase(
      this.userPresetRepository,
      this.transaction(),
    );
  }
}
