import type { AuthSessionRow } from "../../../db";
import type { AuthSession } from "../types/auth.model";

export class AuthMapper {
  static toSession = (row: AuthSessionRow): AuthSession => ({
    id: row.id,
    userId: row.user_id,
    expiresAt: row.expires_at.toISOString(),
    createdAt: row.created_at.toISOString(),
  });
}
