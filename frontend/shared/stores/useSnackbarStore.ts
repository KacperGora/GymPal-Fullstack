import { create } from 'zustand';

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarMessage {
  id: string;
  message: string;
  severity: SnackbarSeverity;
  autoHideDuration?: number;
}

interface SnackbarStore {
  snackbars: SnackbarMessage[];
  recentMessages: Map<string, number>;
  showSnackbar: (
    message: string,
    severity?: SnackbarSeverity,
    autoHideDuration?: number,
  ) => void;
  hideSnackbar: (id: string) => void;
}

const MAX_SNACKBARS = 3;
const RATE_LIMIT_WINDOW = 5000;
const DUPLICATE_WINDOW = 3000;

export const useSnackbarStore = create<SnackbarStore>((set, get) => ({
  snackbars: [],
  recentMessages: new Map(),
  showSnackbar: (message, severity = 'info', autoHideDuration = 6000) => {
    const state = get();
    const now = Date.now();

    const messageKey = `${message}-${severity}`;
    const lastShown = state.recentMessages.get(messageKey);
    if (lastShown && now - lastShown < DUPLICATE_WINDOW) {
      return; // Skip duplicate message
    }

    if (state.snackbars.length >= MAX_SNACKBARS) {
      return;
    }

    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `snackbar-${Date.now()}-${Math.random()}`;

    const recentMessages = new Map(state.recentMessages);
    for (const [key, timestamp] of recentMessages.entries()) {
      if (now - timestamp > RATE_LIMIT_WINDOW) {
        recentMessages.delete(key);
      }
    }
    recentMessages.set(messageKey, now);

    set({
      snackbars: [
        ...state.snackbars,
        { id, message, severity, autoHideDuration },
      ],
      recentMessages,
    });
  },
  hideSnackbar: (id) =>
    set((state) => ({
      snackbars: state.snackbars.filter((snackbar) => snackbar.id !== id),
    })),
}));
