import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSnackbar } from '../useSnackbar';

const mockShowSnackbar = vi.fn();

vi.mock('../../stores/useSnackbarStore', () => ({
  useSnackbarStore: (selector: (state: unknown) => unknown) => {
    const state = {
      showSnackbar: mockShowSnackbar,
    };
    return selector ? selector(state) : state;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useSnackbar', () => {
  it('should expose helper functions and showSnackbar', () => {
    const { result } = renderHook(() => useSnackbar());

    expect(result.current.showSuccess).toBeDefined();
    expect(result.current.showError).toBeDefined();
    expect(result.current.showWarning).toBeDefined();
    expect(result.current.showInfo).toBeDefined();
    expect(result.current.showSnackbar).toBeDefined();
  });

  it('should call showSnackbar with success severity', () => {
    const { result } = renderHook(() => useSnackbar());

    result.current.showSuccess('Success message');

    expect(mockShowSnackbar).toHaveBeenCalledWith('Success message', 'success');
  });

  it('should call showSnackbar with error severity', () => {
    const { result } = renderHook(() => useSnackbar());

    result.current.showError('Error message');

    expect(mockShowSnackbar).toHaveBeenCalledWith('Error message', 'error');
  });

  it('should call showSnackbar with warning severity', () => {
    const { result } = renderHook(() => useSnackbar());

    result.current.showWarning('Warning message');

    expect(mockShowSnackbar).toHaveBeenCalledWith('Warning message', 'warning');
  });

  it('should call showSnackbar with info severity', () => {
    const { result } = renderHook(() => useSnackbar());

    result.current.showInfo('Info message');

    expect(mockShowSnackbar).toHaveBeenCalledWith('Info message', 'info');
  });

  it('should expose the raw showSnackbar function', () => {
    const { result } = renderHook(() => useSnackbar());

    result.current.showSnackbar('Custom message', 'warning', 3000);

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      'Custom message',
      'warning',
      3000,
    );
  });
});
