'use server';

import { signInWithPassword } from '@/app/lib/auth-api-client';
import { redirect } from 'next/navigation';

export interface LoginFormState {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
}

export async function login(
  prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // basic validation
  if (!email || !password) {
    return {
      errors: {
        email: !email ? ['Email is required'] : undefined,
        password: !password ? ['Password is required'] : undefined,
      },
    };
  }

  // email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      errors: {
        email: ['Please enter a valid email address'],
      },
    };
  }

  try {
    // call the login function
    const result = await signInWithPassword(email, password);

    if (!result.success) {
      return {
        errors: {
          _form: [result.error || 'Invalid email or password'],
        },
      };
    }

    // login successfully, redirect to admin page
    // 注意：redirect() 会抛出特殊错误来触发重定向，不应该被 catch 捕获
    redirect('/sudoku/admin');
  } catch (error) {
    // check if it is a redirect error, if so, throw it again
    // redirect() 会抛出带有 digest 属性的错误
    if (
      error instanceof Error &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }

    console.error('Error logging in:', error);
    return {
      errors: {
        _form: ['An unexpected error occurred. Please try again.'],
      },
    };
  }
}
