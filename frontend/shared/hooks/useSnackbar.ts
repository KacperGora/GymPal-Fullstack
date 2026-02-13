import { useSnackbarStore } from '../stores/useSnackbarStore';

export const useSnackbar = () => {
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  return {
    showSuccess: (message: string) => showSnackbar(message, 'success'),
    showError: (message: string) => showSnackbar(message, 'error'),
    showWarning: (message: string) => showSnackbar(message, 'warning'),
    showInfo: (message: string) => showSnackbar(message, 'info'),
    showSnackbar,
  };
};

export { useSnackbarStore } from '../stores/useSnackbarStore';
