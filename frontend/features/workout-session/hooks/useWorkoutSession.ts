'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

export interface WorkoutSet {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

export type SessionStatus = 'idle' | 'active' | 'ended';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export const useWorkoutSession = () => {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting');

  useEffect(() => {
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

    socket.on('connect', () => setConnectionStatus('connected'));
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('connect_error', () => setConnectionStatus('disconnected'));

    return () => {
      socket.disconnect();
    };
  }, []);

  const startWorkout = () => {
    socketRef.current?.emit('workout:start');
    setStatus('active');
  };

  const logSet = (set: WorkoutSet) => {
    socketRef.current?.emit('workout:set', set);
  };

  const endWorkout = () => {
    socketRef.current?.emit('workout:end');
    setStatus('ended');
  };

  return { status, connectionStatus, startWorkout, logSet, endWorkout };
};
