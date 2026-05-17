import { TeaSessionHelper, TeaSessionMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DeviceSessionLogRecord } from "../types/tea-session.model";
import type { TeaSessionRepository } from "../tea-session.repository";

export interface RecordDeviceSessionInput {
  userId: string;
  deviceId: string;
  record: DeviceSessionLogRecord;
}

@UseCaseTelemetry
export class RecordDeviceSessionUseCase {
  constructor(private readonly teaSessionRepository: TeaSessionRepository) {}

  async exec(input: RecordDeviceSessionInput) {
    const row = await this.teaSessionRepository.createFromDevice({
      id: TeaSessionHelper.generateTeaSessionId(),
      userId: input.userId,
      deviceId: input.deviceId,
      localRecordId: input.record.id,
      presetIndex: input.record.presetIndex,
      presetName: input.record.presetName,
      startedAt: TeaSessionHelper.unixSecondsToDate(input.record.startedAt),
      finishedAt: TeaSessionHelper.unixSecondsToDate(input.record.finishedAt),
      rinseStartedAt: TeaSessionHelper.unixSecondsToDate(
        input.record.rinseStartedAt,
      ),
      infusionStartedAt: input.record.infusionStartedAt.map((startedAt) =>
        TeaSessionHelper.unixSecondsToDate(startedAt),
      ),
      finishedEarly: input.record.finishedEarly,
      completedInfusionCount: input.record.completedInfusionCount,
      infusionSec: input.record.infusionSec,
      rinseSec: input.record.rinseSec,
      rawPayload: input.record,
    });

    return row ? TeaSessionMapper.toTeaSession(row) : null;
  }
}
