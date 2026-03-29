'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

export interface LiveSet {
  clientId: number;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  timestamp: string;
}

export type LiveStatus = 'offline' | 'active' | 'ended';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface WorkoutSnapshot {
  clientId: number;
  startedAt: string;
  sets: LiveSet[];
  status: 'active';
}

export const useClientLiveSession = (clientId: number) => {
  const socketRef = useRef<Socket | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('offline');
  const [sets, setSets] = useState<LiveSet[]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting');

  useEffect(() => {
    if (!clientId) return;

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/workout`,
      {
        withCredentials: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      },
    );
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('trainer:watch', { clientId });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('trainer:watching', () => {
      // joined room — waiting for events or snapshot
    });

    // Full session state for late-joining / reconnecting trainer
    socket.on('workout:snapshot', (data: WorkoutSnapshot) => {
      setLiveStatus('active');
      setStartedAt(data.startedAt);
      setSets(data.sets as LiveSet[]);
    });

    socket.on(
      'workout:started',
      (data: { clientId: number; startedAt: string }) => {
        setLiveStatus('active');
        setStartedAt(data.startedAt);
        setSets([]);
      },
    );

    socket.on('workout:set', (data: LiveSet) => {
      setLiveStatus((prev) => (prev === 'offline' ? 'active' : prev));
      setSets((prev) => [...prev, data]);
    });

    socket.on('workout:ended', () => {
      setLiveStatus('ended');
    });

    socket.on('exception', (err: unknown) => {
      console.warn('[LiveSession] WsException:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [clientId]);

  return { liveStatus, sets, startedAt, connectionStatus };
};
