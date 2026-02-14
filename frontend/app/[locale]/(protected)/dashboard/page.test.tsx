import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useAuth } from '@/shared/hooks/useAuth';
import { renderWithProviders } from '@/shared/test/test-utils';

import Dashboard from './page';

// Mock all dependencies
vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/nutrition/mutations', () => ({
  useAddWater: vi.fn(() => ({ mutate: vi.fn() })),
  useRemoveWater: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock('@/features/nutrition/queries', () => ({
  useMeals: vi.fn(() => ({ data: [], isLoading: false })),
  useTdee: vi.fn(() => ({ data: null, isLoading: false })),
  useWaterIntake: vi.fn(() => ({ data: null, isLoading: false })),
  useWeeklyStats: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/features/workouts/queries', () => ({
  useWeeklyWorkoutStats: vi.fn(() => ({ data: [], isLoading: false })),
}));

// Mock dashboard components
vi.mock('@/features/dashboard/components', () => ({
  DashCalorieCard: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="calorie-card">
      {isLoading ? 'Loading...' : 'Calorie Card'}
    </div>
  ),
  DashGoalCard: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="goal-card">{isLoading ? 'Loading...' : 'Goal Card'}</div>
  ),
  DashMacrosCard: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="macros-card">
      {isLoading ? 'Loading...' : 'Macros Card'}
    </div>
  ),
  DashWaterCard: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="water-card">
      {isLoading ? 'Loading...' : 'Water Card'}
    </div>
  ),
  DashWeeklyChart: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="weekly-chart">
      {isLoading ? 'Loading...' : 'Weekly Chart'}
    </div>
  ),
  WorkoutFrequencyChart: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="workout-frequency-chart">
      {isLoading ? 'Loading...' : 'Workout Frequency Chart'}
    </div>
  ),
  MacroBreakdownChart: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="macro-breakdown-chart">
      {isLoading ? 'Loading...' : 'Macro Breakdown Chart'}
    </div>
  ),
}));

const mockUseAuth = vi.mocked(useAuth);

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      logout: vi.fn(),
    });

    renderWithProviders(<Dashboard />);

    // Check for MUI Skeleton (it creates a span with animation)
    const skeleton = document.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, firstName: 'John', email: 'john@example.com' },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
    });

    renderWithProviders(<Dashboard />);

    // Check for greeting heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders all dashboard sections', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, firstName: 'John', email: 'john@example.com' },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
    });

    renderWithProviders(<Dashboard />);

    expect(screen.getByTestId('calorie-card')).toBeInTheDocument();
    expect(screen.getByTestId('goal-card')).toBeInTheDocument();
    expect(screen.getByTestId('macros-card')).toBeInTheDocument();
    expect(screen.getByTestId('water-card')).toBeInTheDocument();
    expect(screen.getByTestId('weekly-chart')).toBeInTheDocument();
    expect(screen.getByTestId('workout-frequency-chart')).toBeInTheDocument();
    expect(screen.getByTestId('macro-breakdown-chart')).toBeInTheDocument();
  });

  it('displays user greeting with first name', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, firstName: 'Alice', email: 'alice@example.com' },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
    });

    renderWithProviders(<Dashboard />);

    // Check that heading contains the firstName 'Alice'
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Alice');
  });

  it('handles user with no first name', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'user@example.com' },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
    });

    renderWithProviders(<Dashboard />);

    // Should render without error even if firstName is undefined
    const heading = screen.getByRole('heading', { name: 'greeting' });
    expect(heading).toBeInTheDocument();
  });
});
