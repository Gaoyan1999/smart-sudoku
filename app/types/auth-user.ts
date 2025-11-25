// 在文件顶部添加
export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
}
