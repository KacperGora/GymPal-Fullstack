import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface SubscriptionStreamState {
  isPending: boolean;
  timedOut: boolean;
}

// Client-side timeout — slightly longer than backend SSE_TIMEOUT_MS (30s)
const CLIENT_TIMEOUT_MS = 35_000;

export const useSubscriptionStream = (
  enabled: boolean,
): SubscriptionStreamState => {
  const queryClient = useQueryClient();
  // Track terminal states — setState only ever called inside async callbacks
  const [activated, setActivated] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const es = new EventSource('/api/subscriptions/stream', {
      withCredentials: true,
    });

    const timeout = setTimeout(() => {
      setTimedOut(true);
      es.close();
    }, CLIENT_TIMEOUT_MS);

    es.onmessage = () => {
      clearTimeout(timeout);
      setActivated(true);
      void queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
      es.close();
    };

    es.onerror = () => {
      clearTimeout(timeout);
      es.close();
    };

    return () => {
      clearTimeout(timeout);
      es.close();
    };
  }, [enabled, queryClient]);

  const isPending = enabled && !activated && !timedOut;

  return { isPending, timedOut: enabled && timedOut };
};
