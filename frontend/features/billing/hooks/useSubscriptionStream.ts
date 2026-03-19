import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface SubscriptionStreamState {
  isPending: boolean;
  timedOut: boolean;
}

type StreamStatus = 'idle' | 'pending' | 'activated' | 'timedOut';

// Client-side timeout — slightly longer than backend SSE_TIMEOUT_MS (30s)
const CLIENT_TIMEOUT_MS = 35_000;

export const useSubscriptionStream = (
  enabled: boolean,
): SubscriptionStreamState => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StreamStatus>('idle');
  // Fix #2: track previous enabled to reset status when enabled transitions to true
  const [prevEnabled, setPrevEnabled] = useState(enabled);

  if (prevEnabled !== enabled) {
    setPrevEnabled(enabled);
    if (enabled) {
      setStatus('pending');
    }
  }

  useEffect(() => {
    if (!enabled) return;

    const es = new EventSource('/api/subscriptions/stream', {
      withCredentials: true,
    });

    const timeout = setTimeout(() => {
      setStatus('timedOut');
      es.close();
    }, CLIENT_TIMEOUT_MS);

    es.onmessage = (event: MessageEvent) => {
      clearTimeout(timeout);
      // Fix #4: backend wysyła jawny event {status:'timeout'} zamiast cicho zamykać
      const data = event.data
        ? (JSON.parse(event.data as string) as { status?: string })
        : {};

      if (data.status === 'timeout') {
        setStatus('timedOut');
      } else {
        setStatus('activated');
        void queryClient.invalidateQueries({
          queryKey: ['subscription', 'me'],
        });
      }
      es.close();
    };

    es.onerror = () => {
      clearTimeout(timeout);
      setStatus('timedOut');
      es.close();
    };

    return () => {
      clearTimeout(timeout);
      es.close();
    };
  }, [enabled, queryClient]);

  return {
    isPending: enabled && status === 'pending',
    timedOut: enabled && status === 'timedOut',
  };
};
