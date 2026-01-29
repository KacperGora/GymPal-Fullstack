'use client';

import { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress } from '@mui/material';

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    try {
      if (email === 'admin@example.com' && password === '1234') {
        window.location.href = '/dashboard';
      } else {
        setError('Niepoprawne dane logowania');
      }
    } catch {
      setError('Wystąpił błąd podczas logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component='form'
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, mx: 'auto', mt: 5 }}
    >
      <TextField label='Email' name='email' type='email' required disabled={loading} />
      <TextField label='Hasło' name='password' type='password' required disabled={loading} />
      <TextField
        label='Potwierdź hasło'
        name='confirmPassword'
        type='password'
        required
        disabled={loading}
      />

      <Button type='submit' variant='contained' disabled={loading}>
        {loading ? <CircularProgress size={24} color='inherit' /> : 'Zarejestruj'}
      </Button>

      {error && <Alert severity='error'>{error}</Alert>}
    </Box>
  );
}
