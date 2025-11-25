import { getSupabaseClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function getSession() {
  const supabase = await getSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}
export async function getUser() {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getUserRole(): Promise<'user' | 'admin' | undefined> {
  const user = await getUser();

  if (!user) {
    return;
  }

  // query role from user_roles table
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    // if no record in user_roles table, default to user
    return 'user';
  }

  return data.role as 'user' | 'admin';
}

export async function requireLogin() {
  const user = await getUser();

  if (!user) {
    // not logged in, redirect to login page
    redirect('/sudoku/login');
  }

  return user;
}
export async function requireAdmin() {
  const user = await requireLogin();

  const role = await getUserRole();

  if (role !== 'admin') {
    // not admin, redirect to login page
    redirect('/sudoku/login');
  }

  return user;
}

/**
 * login with email and password
 * @param email email
 * @param password password
 * @returns login result, contains user information or error
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false as const,
      error: error.message || 'Invalid email or password',
      user: null,
    };
  }

  if (!data.user) {
    return {
      success: false as const,
      error: 'Login failed. Please try again.',
      user: null,
    };
  }

  return {
    success: true as const,
    error: null,
    user: data.user,
  };
}
