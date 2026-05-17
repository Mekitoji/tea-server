import { PatchTeaSessionUseCase } from "./patch-tea-session.use-case";
import { FindTeaSessionByIdUseCase } from "./find-tea-session-by-id.use-case";
import { ListUserTeaSessionsUseCase } from "./list-user-tea-sessions.use-case";
import { RecordDeviceSessionUseCase } from "./record-device-session.use-case";
import type { DB } from "../../../db";
import type { TeaSessionRepository } from "../tea-session.repository";
import type { TeaRepository } from "../../tea/tea.repository";
import type { TransactionBuilder } from "kysely";

export interface TeaSessionUseCases {
  FindTeaSessionById: FindTeaSessionByIdUseCase;
  ListUserTeaSessions: ListUserTeaSessionsUseCase;
  RecordDeviceSession: RecordDeviceSessionUseCase;
}

export interface TeaSessionUseCasesTransactionFactory {
  createPatchTeaSession(): PatchTeaSessionUseCase;
}

export const createTeaSessionUseCases = (
  repository: TeaSessionRepository,
): TeaSessionUseCases => {
  const findTeaSessionByIdUseCase = new FindTeaSessionByIdUseCase(repository);
  const listUserTeaSessionsUseCase = new ListUserTeaSessionsUseCase(repository);
  const recordDeviceSessionUseCase = new RecordDeviceSessionUseCase(repository);

  return {
    FindTeaSessionById: findTeaSessionByIdUseCase,
    ListUserTeaSessions: listUserTeaSessionsUseCase,
    RecordDeviceSession: recordDeviceSessionUseCase,
  };
};

export class TeaSessionUseCaseFactory
  implements TeaSessionUseCasesTransactionFactory
{
  constructor(
    private readonly teaSessionRepository: TeaSessionRepository,
    private readonly teaRepository: TeaRepository,
    private readonly transaction: () => TransactionBuilder<DB>,
  ) {}

  createPatchTeaSession() {
    return new PatchTeaSessionUseCase(
      this.teaSessionRepository,
      this.teaRepository,
      this.transaction(),
    );
  }
}
