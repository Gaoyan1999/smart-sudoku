'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, TextField, Typography, Alert, Paper, Link } from '@mui/material';
import { login, LoginFormState } from '@/app/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(
    login,
    {} as LoginFormState
  );

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Admin Login
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Please sign in to access the admin panel
        </Typography>

        <Box component="form" action={formAction} sx={{ mt: 3 }}>
          {/* email input */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            error={!!state?.errors?.email}
            helperText={state?.errors?.email?.[0]}
            disabled={isPending}
          />

          {/* password input */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            error={!!state?.errors?.password}
            helperText={state?.errors?.password?.[0]}
            disabled={isPending}
          />

          {state?.errors?._form && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {state.errors._form[0]}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isPending}
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => router.push('/sudoku')}
              sx={{ cursor: 'pointer' }}
            >
              Back to Game
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
