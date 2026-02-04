import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { useZodForm } from '../useZodForm';

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

describe('useZodForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useZodForm(schema, {
        defaultValues: { email: '', password: '' },
      }),
    );

    expect(result.current.getValues()).toEqual({ email: '', password: '' });
  });

  it('should fail validation for invalid data', async () => {
    const { result } = renderHook(() =>
      useZodForm(schema, {
        defaultValues: { email: '', password: '' },
      }),
    );

    let isValid: boolean | undefined;

    await act(async () => {
      isValid = await result.current.trigger();
    });

    expect(isValid).toBe(false);
  });

  it('should pass validation with valid data', async () => {
    const { result } = renderHook(() =>
      useZodForm(schema, {
        defaultValues: { email: 'test@example.com', password: '12345678' },
      }),
    );

    let submitted = false;

    await act(async () => {
      await result.current.handleSubmit(() => {
        submitted = true;
      })();
    });

    expect(submitted).toBe(true);
  });

  it('should reject password shorter than 8 characters', async () => {
    const { result } = renderHook(() =>
      useZodForm(schema, {
        defaultValues: { email: 'test@example.com', password: 'short' },
      }),
    );

    let submitted = false;

    await act(async () => {
      await result.current.handleSubmit(() => {
        submitted = true;
      })();
    });

    expect(submitted).toBe(false);
  });

  it('should reject invalid email', async () => {
    const { result } = renderHook(() =>
      useZodForm(schema, {
        defaultValues: { email: 'not-an-email', password: '12345678' },
      }),
    );

    let isValid: boolean | undefined;

    await act(async () => {
      isValid = await result.current.trigger();
    });

    expect(isValid).toBe(false);
  });
});
