import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../shared/db/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { ACCESS_TOKEN_COOKIE, Role } from '@gympal/shared';

interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

interface WorkoutSetPayload {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

interface WorkoutSetRecord extends WorkoutSetPayload {
  timestamp: string;
}

interface WorkoutSession {
  readonly clientId: number;
  readonly startedAt: string;
  readonly sets: readonly WorkoutSetRecord[];
  readonly status: 'active';
}

function parseCookie(str: string): Record<string, string> {
  return str
    .split(';')
    .map((pair) => pair.trim().split('='))
    .reduce<Record<string, string>>((acc, [key, ...rest]) => {
      if (key)
        acc[decodeURIComponent(key.trim())] = decodeURIComponent(
          rest.join('=').trim(),
        );
      return acc;
    }, {});
}

const SESSION_TTL_SECONDS = 4 * 60 * 60; // 4 hours
const DISCONNECT_CLEANUP_DELAY_MS = 30_000; // 30 seconds

@WebSocketGateway({
  namespace: '/workout',
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
})
export class WorkoutGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private readonly disconnectTimers = new Map<number, NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private sessionKey(clientId: number): string {
    return `workout:session:${clientId}`;
  }

  async handleConnection(socket: Socket): Promise<void> {
    const cookieHeader = socket.handshake.headers.cookie ?? '';
    const cookies = parseCookie(cookieHeader);
    const token = cookies[ACCESS_TOKEN_COOKIE];
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      socket.disconnect();
      return;
    }

    try {
      const payload = jwt.verify(token, secret) as unknown as {
        sub: number;
        email: string;
        role: Role;
      };
      const user: AuthUser = {
        id: Number(payload.sub),
        email: payload.email,
        role: payload.role,
      };
      socket.data.user = user;

      if (user.role === Role.CLIENT) {
        await socket.join(`client:${user.id}`);

        // Cancel any pending cleanup timer on reconnect
        const existing = this.disconnectTimers.get(user.id);
        if (existing) {
          clearTimeout(existing);
          this.disconnectTimers.delete(user.id);
        }
      }
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket): void {
    const user = socket.data.user as AuthUser | undefined;
    if (!user || user.role !== Role.CLIENT) return;

    const clientId = user.id;
    const key = this.sessionKey(clientId);

    const timer = setTimeout(() => {
      void this.redis.exists(key).then((active) => {
        if (!active) return;
        void this.redis.del(key);
        this.server.to(`client:${clientId}`).emit('workout:ended', {
          clientId,
          endedAt: new Date().toISOString(),
        });
      });
      this.disconnectTimers.delete(clientId);
    }, DISCONNECT_CLEANUP_DELAY_MS);

    this.disconnectTimers.set(clientId, timer);
  }

  @SubscribeMessage('workout:start')
  async handleWorkoutStart(@ConnectedSocket() socket: Socket): Promise<void> {
    const user = socket.data.user as AuthUser | undefined;
    if (!user || user.role !== Role.CLIENT) {
      throw new WsException('Forbidden: clients only');
    }

    const startedAt = new Date().toISOString();
    const session: WorkoutSession = {
      clientId: user.id,
      startedAt,
      sets: [],
      status: 'active',
    };

    await this.redis.set(
      this.sessionKey(user.id),
      session,
      SESSION_TTL_SECONDS,
    );

    this.server.to(`client:${user.id}`).emit('workout:started', {
      clientId: user.id,
      startedAt,
    });
  }

  @SubscribeMessage('workout:set')
  async handleWorkoutSet(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: WorkoutSetPayload,
  ): Promise<void> {
    const user = socket.data.user as AuthUser | undefined;
    if (!user || user.role !== Role.CLIENT) {
      throw new WsException('Forbidden: clients only');
    }

    const key = this.sessionKey(user.id);
    const newSet: WorkoutSetRecord = {
      exercise: body.exercise,
      sets: body.sets,
      reps: body.reps,
      weight: body.weight,
      timestamp: new Date().toISOString(),
    };

    const existing = await this.redis.get<WorkoutSession>(key);
    const updatedSession: WorkoutSession = existing
      ? { ...existing, sets: [...existing.sets, newSet] }
      : {
          clientId: user.id,
          startedAt: new Date().toISOString(),
          sets: [newSet],
          status: 'active',
        };

    await this.redis.set(key, updatedSession, SESSION_TTL_SECONDS);

    this.server.to(`client:${user.id}`).emit('workout:set', {
      clientId: user.id,
      ...newSet,
    });
  }

  @SubscribeMessage('workout:end')
  async handleWorkoutEnd(@ConnectedSocket() socket: Socket): Promise<void> {
    const user = socket.data.user as AuthUser | undefined;
    if (!user || user.role !== Role.CLIENT) {
      throw new WsException('Forbidden: clients only');
    }

    await this.redis.del(this.sessionKey(user.id));

    this.server.to(`client:${user.id}`).emit('workout:ended', {
      clientId: user.id,
      endedAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('trainer:watch')
  async handleTrainerWatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { clientId: number },
  ): Promise<void> {
    const user = socket.data.user as AuthUser | undefined;
    if (!user || user.role !== Role.TRAINER) {
      throw new WsException('Forbidden: trainers only');
    }

    const clientId = Number(body.clientId);
    if (!clientId || isNaN(clientId)) {
      throw new WsException('Invalid clientId');
    }

    const relation = await this.prisma.trainerClient.findUnique({
      where: { trainerId_clientId: { trainerId: user.id, clientId } },
      select: { status: true },
    });

    if (!relation || relation.status !== 'ACTIVE') {
      throw new WsException('Forbidden: no active trainer-client relation');
    }

    await socket.join(`client:${clientId}`);
    socket.emit('trainer:watching', { clientId });

    // Send current session snapshot if workout is already in progress
    const session = await this.redis.get<WorkoutSession>(
      this.sessionKey(clientId),
    );
    if (session) {
      socket.emit('workout:snapshot', session);
    }
  }
}
