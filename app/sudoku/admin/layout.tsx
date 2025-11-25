// app/sudoku/admin/layout.tsx (服务器组件)
import { requireAdmin } from '@/app/lib/auth-api-client';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
