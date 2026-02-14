import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useRegister } from '@/features/auth/mutations/useRegister';
import { renderWithProviders } from '@/shared/test/test-utils';

import RegisterForm from './RegisterForm';

// Mock the useRegister hook
vi.mock('@/features/auth/mutations/useRegister', () => ({
  useRegister: vi.fn(),
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

const mockUseRegister = vi.mocked(useRegister);

describe('RegisterForm', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRegister.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useRegister>);
  });

  it('renders all registration fields', () => {
    const { container } = renderWithProviders(<RegisterForm />);

    expect(
      screen.getByRole('textbox', { name: 'firstName' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'lastName' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'email' })).toBeInTheDocument();
    // Password fields don't have textbox role, check by name attribute
    const passwordFields = container.querySelectorAll('input[name="password"]');
    const confirmPasswordFields = container.querySelectorAll(
      'input[name="confirmPassword"]',
    );
    expect(passwordFields.length).toBe(1);
    expect(confirmPasswordFields.length).toBe(1);
  });

  it('renders role selection options', () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByText('roleSolo')).toBeInTheDocument();
    expect(screen.getByText('roleCoach')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<RegisterForm />);

    const passwordInput = container.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    const toggleButtons = screen.getAllByRole('button', { name: '' });
    const passwordToggle = toggleButtons[0];

    expect(passwordInput.type).toBe('password');

    await user.click(passwordToggle);
    expect(passwordInput.type).toBe('text');

    await user.click(passwordToggle);
    expect(passwordInput.type).toBe('password');
  });

  it('toggles confirm password visibility', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<RegisterForm />);

    const confirmPasswordInput = container.querySelector(
      'input[name="confirmPassword"]',
    ) as HTMLInputElement;
    const toggleButtons = screen.getAllByRole('button', { name: '' });
    const confirmPasswordToggle = toggleButtons[1];

    expect(confirmPasswordInput.type).toBe('password');

    await user.click(confirmPasswordToggle);
    expect(confirmPasswordInput.type).toBe('text');

    await user.click(confirmPasswordToggle);
    expect(confirmPasswordInput.type).toBe('password');
  });

  it('calls mutate with form data on valid submission', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<RegisterForm />);

    const firstNameInput = screen.getByRole('textbox', { name: 'firstName' });
    const lastNameInput = screen.getByRole('textbox', { name: 'lastName' });
    const emailInput = screen.getByRole('textbox', { name: 'email' });
    const passwordInput = container.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    const confirmPasswordInput = container.querySelector(
      'input[name="confirmPassword"]',
    ) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'submit' });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john.doe@example.com');
    await user.type(passwordInput, 'ValidPass123!');
    await user.type(confirmPasswordInput, 'ValidPass123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'ValidPass123!',
      });
    });
  });

  it('shows error message when registration fails', () => {
    const axiosError = new AxiosError('Registration failed');
    axiosError.response = { status: 401 } as AxiosError['response'];

    mockUseRegister.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: axiosError,
    } as unknown as ReturnType<typeof useRegister>);

    renderWithProviders(<RegisterForm />);

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'errorInvalid',
    );
  });

  it('shows general error message when registration fails with non-401 error', () => {
    const error = new Error('Network error');

    mockUseRegister.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: error,
    } as unknown as ReturnType<typeof useRegister>);

    renderWithProviders(<RegisterForm />);

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'errorGeneral',
    );
  });

  it('disables form fields when mutation is pending', () => {
    mockUseRegister.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as unknown as ReturnType<typeof useRegister>);

    const { container } = renderWithProviders(<RegisterForm />);

    const firstNameInput = screen.getByRole('textbox', {
      name: 'firstName',
    }) as HTMLInputElement;
    const lastNameInput = screen.getByRole('textbox', {
      name: 'lastName',
    }) as HTMLInputElement;
    const emailInput = screen.getByRole('textbox', {
      name: 'email',
    }) as HTMLInputElement;
    const passwordInput = container.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    const confirmPasswordInput = container.querySelector(
      'input[name="confirmPassword"]',
    ) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'submit' });

    expect(firstNameInput.disabled).toBe(true);
    expect(lastNameInput.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
    expect(confirmPasswordInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
  });

  it('allows role selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    const soloOption = screen.getByText('roleSolo').closest('[role="button"]');
    const coachOption = screen
      .getByText('roleCoach')
      .closest('[role="button"]');

    expect(soloOption).toHaveAttribute('aria-pressed', 'true');
    expect(coachOption).toHaveAttribute('aria-pressed', 'false');

    // Note: Coach option is disabled in the component, so we won't test clicking it
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: 'submit' });
    await user.click(submitButton);

    await waitFor(() => {
      // Look for MUI error text in helper text elements
      const helperTexts = container.querySelectorAll('.MuiFormHelperText-root');
      expect(helperTexts.length).toBeGreaterThan(0);
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
