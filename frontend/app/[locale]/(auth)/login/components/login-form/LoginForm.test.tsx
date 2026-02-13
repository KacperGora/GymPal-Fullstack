import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useLogin } from '@/features/auth/mutations/useLogin';
import { renderWithProviders } from '@/shared/test/test-utils';

import { LoginForm } from './LoginForm';

// Mock the useLogin hook
vi.mock('@/features/auth/mutations/useLogin', () => ({
  useLogin: vi.fn(),
}));

// Mock auth components
vi.mock('@/features/auth/components', () => ({
  AuthCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-card">{children}</div>
  ),
  AuthFormLayout: ({
    children,
    onSubmit,
    error,
  }: {
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    error?: string | null;
  }) => (
    <form onSubmit={onSubmit} data-testid="auth-form">
      {error && <div data-testid="error-message">{error}</div>}
      {children}
    </form>
  ),
  AuthSubmitButton: ({
    label,
    loading,
  }: {
    label: string;
    loading: boolean;
  }) => (
    <button type="submit" disabled={loading}>
      {label}
    </button>
  ),
}));

// Import after mocking

const mockUseLogin = vi.mocked(useLogin);

describe('LoginForm', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useLogin>);
  });

  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText('email')).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();
  });

  it('renders submit button, register and forgot password links', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'register' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'forgotPassword' }),
    ).toBeInTheDocument();
  });

  it('toggles password visibility when clicking the eye icon', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText('password') as HTMLInputElement;

    // Initially password should be hidden
    expect(passwordInput.type).toBe('password');

    // Find and click the visibility toggle button
    const toggleButton = screen.getByRole('button', { name: '' });
    await user.click(toggleButton);

    // Password should now be visible
    expect(passwordInput.type).toBe('text');

    // Click again to hide
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: 'submit' });
    await user.click(submitButton);

    // Wait for validation errors to appear (Zod validation messages)
    await waitFor(
      () => {
        const errors = screen.queryAllByText(/invalid/i);
        expect(errors.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    // Mutate should not be called with invalid data
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls mutate with form data on valid submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText('email');
    const passwordInput = screen.getByLabelText('password');
    const submitButton = screen.getByRole('button', { name: 'submit' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error message when login fails with 401', () => {
    const axiosError = new AxiosError('Unauthorized');
    axiosError.response = { status: 401 } as AxiosError['response'];

    mockUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: axiosError,
    } as unknown as ReturnType<typeof useLogin>);

    renderWithProviders(<LoginForm />);

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'errorInvalid',
    );
  });

  it('shows general error message when login fails with other error', () => {
    const error = new Error('Network error');

    mockUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: error,
    } as unknown as ReturnType<typeof useLogin>);

    renderWithProviders(<LoginForm />);

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'errorGeneral',
    );
  });
});
