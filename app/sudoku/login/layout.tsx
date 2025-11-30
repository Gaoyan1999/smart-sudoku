import { getUser } from '@/app/lib/auth-api-client';
import { redirect } from 'next/navigation';
export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (user) {
    return redirect('/sudoku');
  }
  return <>{children}</>;
}
