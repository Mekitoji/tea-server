import type { UserRow } from "../../../db";
import type { User, UserRole } from "../types/user.model";

export class UserMapper {
  static toUser = (row: UserRow): User => ({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role as UserRole,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });
}
