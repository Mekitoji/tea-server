import type { DeviceTokenPrincipal } from "../device/types/device.model";
import type { SessionJournalSyncRequest } from "./types/device-sync.model";
import type { DeviceSyncUseCasesTransactionFactory } from "./use-cases";

interface SyncSessionJournalRequest {
  body: SessionJournalSyncRequest;
  currentDevice: DeviceTokenPrincipal;
}

export class DeviceSyncController {
  constructor(
    private readonly useCasesFactory: DeviceSyncUseCasesTransactionFactory,
  ) {}

  async syncSessionJournal({ body, currentDevice }: SyncSessionJournalRequest) {
    return this.useCasesFactory.createSyncDeviceSessionJournal().exec({
      ...body,
      currentDevice,
    });
  }
}
