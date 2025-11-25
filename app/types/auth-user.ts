export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
}
