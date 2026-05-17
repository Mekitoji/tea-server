import type {
  DeviceSessionLogRecord,
  UnixSeconds,
} from "../../tea-session/types/tea-session.model";

export type JournalSyncStatus = "pending" | "synced" | "failed";

export interface SessionJournal {
  version: number;
  updatedAt: UnixSeconds;
  status: JournalSyncStatus;
  retryCount: number;
  records: DeviceSessionLogRecord[];
}

export interface SessionJournalSyncRequest {
  schemaVersion: 1;
  journal: SessionJournal;
}

export interface SessionJournalSyncResponse {
  ok: true;
  serverTime: UnixSeconds;
  acceptedRecordCount: number;
  status: "synced";
}
