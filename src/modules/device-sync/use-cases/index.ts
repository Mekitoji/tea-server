import { SyncDeviceSessionJournalUseCase } from "./sync-device-session-journal.use-case";
import type { DB } from "../../../db";
import type { TransactionBuilder } from "kysely";
import type { DeviceRepository } from "../../device/device.repository";
import type { TeaSessionRepository } from "../../tea-session/tea-session.repository";

export interface DeviceSyncUseCasesTransactionFactory {
  createSyncDeviceSessionJournal(): SyncDeviceSessionJournalUseCase;
}

export class DeviceSyncUseCaseFactory implements DeviceSyncUseCasesTransactionFactory {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly teaSessionRepository: TeaSessionRepository,
    private readonly transaction: () => TransactionBuilder<DB>,
  ) {}

  createSyncDeviceSessionJournal() {
    const trx = this.transaction();

    return new SyncDeviceSessionJournalUseCase(
      this.deviceRepository,
      this.teaSessionRepository,
      trx,
    );
  }
}
