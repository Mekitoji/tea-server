import { DeviceRepository } from "../../device/device.repository";
import type { DeviceTokenPrincipal } from "../../device/types/device.model";
import { TeaSessionHelper } from "../../tea-session/libs";
import { TeaSessionRepository } from "../../tea-session/tea-session.repository";
import {
  record,
  setTelemetryAttributes,
  UseCaseTelemetry,
} from "../../../shared/telemetry";
import type {
  SessionJournalSyncRequest,
  SessionJournalSyncResponse,
} from "../types/device-sync.model";
import type { TransactionBuilder } from "kysely";
import type { DB } from "../../../db";

export interface SyncDeviceSessionJournalInput extends SessionJournalSyncRequest {
  currentDevice: DeviceTokenPrincipal;
}

@UseCaseTelemetry
export class SyncDeviceSessionJournalUseCase {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly teaSessionRepository: TeaSessionRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(
    input: SyncDeviceSessionJournalInput,
  ): Promise<SessionJournalSyncResponse> {
    setTelemetryAttributes({
      "device.id": input.currentDevice.deviceId,
      "device.sync.schema_version": input.schemaVersion,
      "device.sync.journal_record_count": input.journal.records.length,
    });

    return record("device_sync.session_journal", async (span) =>
      this.transaction.execute(async (trx) => {
        const trxTeaSessionRepository =
          this.teaSessionRepository.withTransaction(trx);
        const trxDeviceRepository = this.deviceRepository.withTransaction(trx);

        span.setAttributes({
          "user.id": input.currentDevice.userId,
          "device.uid": input.currentDevice.deviceUid,
        });

        await trxDeviceRepository.updateLastSeen(input.currentDevice.deviceId);

        let acceptedRecordCount = 0;

        for (const record of input.journal.records) {
          const row = await trxTeaSessionRepository.createFromDevice({
            id: TeaSessionHelper.generateTeaSessionId(),
            userId: input.currentDevice.userId,
            deviceId: input.currentDevice.deviceId,
            localRecordId: record.id,
            presetIndex: record.presetIndex,
            presetName: record.presetName,
            startedAt: TeaSessionHelper.unixSecondsToDate(record.startedAt),
            finishedAt: TeaSessionHelper.unixSecondsToDate(record.finishedAt),
            rinseStartedAt: TeaSessionHelper.unixSecondsToDate(
              record.rinseStartedAt,
            ),
            infusionStartedAt: record.infusionStartedAt.map((startedAt) =>
              TeaSessionHelper.unixSecondsToDate(startedAt),
            ),
            finishedEarly: record.finishedEarly,
            completedInfusionCount: record.completedInfusionCount,
            infusionSec: record.infusionSec,
            rinseSec: record.rinseSec,
            rawPayload: record,
          });

          if (row) {
            acceptedRecordCount += 1;
          }
        }

        span.setAttribute(
          "device.sync.accepted_record_count",
          acceptedRecordCount,
        );

        return {
          ok: true as const,
          serverTime: Math.floor(Date.now() / 1000),
          acceptedRecordCount,
          status: "synced" as const,
        };
      }),
    );
  }
}
