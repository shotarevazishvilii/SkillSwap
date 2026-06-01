export type UserId = string;

export type UserRole = "member" | "admin";

export interface AppUser {
  createdAt: string;
  email: string;
  id: UserId;
  role: UserRole;
  updatedAt: string;
}
