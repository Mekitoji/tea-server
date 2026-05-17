import type { Context } from "elysia";
import { NotFoundError } from "../../shared/errors";
import type { CreateUserSessionPresetInput } from "./use-cases/create-user-session-preset.use-case";
import type {
  SessionPresetUseCases,
  SessionPresetUseCasesTransactionFactory,
} from "./use-cases";

type ResponseSet = Context["set"];

interface CreateUserSessionPresetRequest {
  userId: string;
  body: Omit<CreateUserSessionPresetInput, "userId">;
  set: ResponseSet;
}

interface ListUserSessionPresetsRequest {
  userId: string;
}

interface DeleteUserSessionPresetRequest {
  params: {
    id: string;
  };
  userId: string;
}

export class SessionPresetController {
  constructor(
    private readonly useCases: SessionPresetUseCases,
    private readonly useCasesFactory: SessionPresetUseCasesTransactionFactory,
  ) {}

  async listDefaultSessionPresets() {
    return this.useCases.ListDefaultSessionPresets.exec();
  }

  async listUserSessionPresets({ userId }: ListUserSessionPresetsRequest) {
    return this.useCases.ListUserSessionPresets.exec(userId);
  }

  async createUserSessionPreset({
    body,
    userId,
    set,
  }: CreateUserSessionPresetRequest) {
    const preset = await this.useCasesFactory
      .createCreateUserSessionPreset()
      .exec({
        ...body,
        userId,
      });
    set.status = 201;

    return preset;
  }

  async deleteUserSessionPreset({
    params,
    userId,
  }: DeleteUserSessionPresetRequest) {
    const preset = await this.useCasesFactory
      .createDeleteUserSessionPreset()
      .exec({
        id: params.id,
        userId,
      });

    if (!preset) {
      throw new NotFoundError("Session preset not found");
    }

    return preset;
  }
}
