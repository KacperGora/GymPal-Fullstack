jest.mock('jsonwebtoken');
jest.mock('@gympal/shared', () => ({
  ACCESS_TOKEN_COOKIE: 'access_token',
  Role: {
    ADMIN: 'ADMIN',
    TRAINER: 'TRAINER',
    CLIENT: 'CLIENT',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { WorkoutGateway } from './workout.gateway';
import { PrismaService } from '../../shared/db/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';

const Role = { ADMIN: 'ADMIN', TRAINER: 'TRAINER', CLIENT: 'CLIENT' } as const;
type RoleValue = (typeof Role)[keyof typeof Role];

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
};

const mockPrisma = {
  trainerClient: {
    findUnique: jest.fn(),
  },
};

const createMockSocket = (user?: {
  id: number;
  email: string;
  role: RoleValue;
}) => ({
  data: { user },
  handshake: { headers: { cookie: 'access_token=valid.jwt.token' } },
  join: jest.fn().mockResolvedValue(undefined),
  emit: jest.fn(),
  disconnect: jest.fn(),
  id: 'socket-id-1',
});

const mockServer = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

describe('WorkoutGateway', () => {
  let gateway: WorkoutGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutGateway,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    gateway = module.get<WorkoutGateway>(WorkoutGateway);
    (gateway as any).server = mockServer;

    jest.clearAllMocks();
    mockServer.to.mockReturnThis();
  });

  describe('handleConnection', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-secret';
    });

    it('should join CLIENT to room and clear pending disconnect timer', async () => {
      const socket = createMockSocket();
      socket.handshake.headers.cookie = 'access_token=valid.token';

      (jwt.verify as jest.Mock).mockReturnValue({
        sub: 1,
        email: 'client@test.com',
        role: Role.CLIENT,
      });

      await gateway.handleConnection(socket as any);

      expect(socket.join).toHaveBeenCalledWith('client:1');
      expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('should not join TRAINER to any room on connect', async () => {
      const socket = createMockSocket();
      (jwt.verify as jest.Mock).mockReturnValue({
        sub: 2,
        email: 'trainer@test.com',
        role: Role.TRAINER,
      });

      await gateway.handleConnection(socket as any);

      expect(socket.join).not.toHaveBeenCalled();
      expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect if no cookie', async () => {
      const socket = createMockSocket();
      socket.handshake.headers.cookie = '';

      await gateway.handleConnection(socket as any);

      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect if JWT is invalid', async () => {
      const socket = createMockSocket();
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      await gateway.handleConnection(socket as any);

      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('should clear pending disconnect timer on CLIENT reconnect', async () => {
      const socket = createMockSocket();
      (jwt.verify as jest.Mock).mockReturnValue({
        sub: 5,
        email: 'client@test.com',
        role: Role.CLIENT,
      });

      const fakeTimer = setTimeout(() => {}, 999999);
      (gateway as any).disconnectTimers.set(5, fakeTimer);

      await gateway.handleConnection(socket as any);

      expect((gateway as any).disconnectTimers.has(5)).toBe(false);
    });
  });

  describe('handleDisconnect', () => {
    it('should schedule cleanup timer for CLIENT with active session', () => {
      jest.useFakeTimers();
      const socket = createMockSocket({
        id: 10,
        email: 'c@test.com',
        role: Role.CLIENT,
      });

      gateway.handleDisconnect(socket as any);

      expect((gateway as any).disconnectTimers.has(10)).toBe(true);
      jest.useRealTimers();
    });

    it('should do nothing for TRAINER disconnect', () => {
      const socket = createMockSocket({
        id: 20,
        email: 't@test.com',
        role: Role.TRAINER,
      });

      gateway.handleDisconnect(socket as any);

      expect((gateway as any).disconnectTimers.has(20)).toBe(false);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('handleWorkoutStart', () => {
    it('should create Redis session and emit workout:started to room', async () => {
      const socket = createMockSocket({
        id: 1,
        email: 'c@test.com',
        role: Role.CLIENT,
      });

      await gateway.handleWorkoutStart(socket as any);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'workout:session:1',
        expect.objectContaining({
          clientId: 1,
          sets: [],
          status: 'active',
        }),
        14400,
      );
      expect(mockServer.to).toHaveBeenCalledWith('client:1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'workout:started',
        expect.objectContaining({ clientId: 1 }),
      );
    });

    it('should throw WsException for non-CLIENT', async () => {
      const socket = createMockSocket({
        id: 2,
        email: 't@test.com',
        role: Role.TRAINER,
      });

      await expect(gateway.handleWorkoutStart(socket as any)).rejects.toThrow(
        WsException,
      );
    });

    it('should throw WsException for unauthenticated socket', async () => {
      const socket = createMockSocket(undefined);

      await expect(gateway.handleWorkoutStart(socket as any)).rejects.toThrow(
        WsException,
      );
    });
  });

  describe('handleWorkoutSet', () => {
    const setPayload = {
      exercise: 'Bench Press',
      sets: 3,
      reps: 10,
      weight: 80,
    };

    it('should append set to existing Redis session and emit to room', async () => {
      const socket = createMockSocket({
        id: 1,
        email: 'c@test.com',
        role: Role.CLIENT,
      });

      const existing = {
        clientId: 1,
        startedAt: '2025-01-01T10:00:00.000Z',
        sets: [],
        status: 'active' as const,
      };
      mockRedis.get.mockResolvedValue(existing);

      await gateway.handleWorkoutSet(socket as any, setPayload);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'workout:session:1',
        expect.objectContaining({
          sets: expect.arrayContaining([
            expect.objectContaining({ exercise: 'Bench Press' }),
          ]),
        }),
        14400,
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        'workout:set',
        expect.objectContaining({ exercise: 'Bench Press', clientId: 1 }),
      );
    });

    it('should create new session if none exists in Redis', async () => {
      const socket = createMockSocket({
        id: 1,
        email: 'c@test.com',
        role: Role.CLIENT,
      });
      mockRedis.get.mockResolvedValue(null);

      await gateway.handleWorkoutSet(socket as any, setPayload);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'workout:session:1',
        expect.objectContaining({
          clientId: 1,
          sets: expect.arrayContaining([
            expect.objectContaining({ exercise: 'Bench Press' }),
          ]),
        }),
        14400,
      );
    });

    it('should throw WsException for non-CLIENT', async () => {
      const socket = createMockSocket({
        id: 2,
        email: 't@test.com',
        role: Role.TRAINER,
      });

      await expect(
        gateway.handleWorkoutSet(socket as any, setPayload),
      ).rejects.toThrow(WsException);
    });
  });

  describe('handleWorkoutEnd', () => {
    it('should delete Redis session and emit workout:ended to room', async () => {
      const socket = createMockSocket({
        id: 1,
        email: 'c@test.com',
        role: Role.CLIENT,
      });

      await gateway.handleWorkoutEnd(socket as any);

      expect(mockRedis.del).toHaveBeenCalledWith('workout:session:1');
      expect(mockServer.to).toHaveBeenCalledWith('client:1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'workout:ended',
        expect.objectContaining({ clientId: 1 }),
      );
    });

    it('should throw WsException for non-CLIENT', async () => {
      const socket = createMockSocket({
        id: 2,
        email: 't@test.com',
        role: Role.TRAINER,
      });

      await expect(gateway.handleWorkoutEnd(socket as any)).rejects.toThrow(
        WsException,
      );
    });
  });

  describe('handleTrainerWatch', () => {
    beforeEach(() => {
      mockPrisma.trainerClient.findUnique.mockResolvedValue({
        status: 'ACTIVE',
      });
    });

    it('should join room, emit trainer:watching, and send snapshot if session active', async () => {
      const socket = createMockSocket({
        id: 99,
        email: 'trainer@test.com',
        role: Role.TRAINER,
      });

      const session = {
        clientId: 1,
        startedAt: '2025-01-01T10:00:00.000Z',
        sets: [
          {
            exercise: 'Squat',
            sets: 4,
            reps: 8,
            weight: 100,
            timestamp: '2025-01-01T10:05:00.000Z',
          },
        ],
        status: 'active',
      };
      mockRedis.get.mockResolvedValue(session);

      await gateway.handleTrainerWatch(socket as any, { clientId: 1 });

      expect(socket.join).toHaveBeenCalledWith('client:1');
      expect(socket.emit).toHaveBeenCalledWith('trainer:watching', {
        clientId: 1,
      });
      expect(socket.emit).toHaveBeenCalledWith('workout:snapshot', session);
    });

    it('should join room and emit trainer:watching without snapshot if no active session', async () => {
      const socket = createMockSocket({
        id: 99,
        email: 'trainer@test.com',
        role: Role.TRAINER,
      });
      mockRedis.get.mockResolvedValue(null);

      await gateway.handleTrainerWatch(socket as any, { clientId: 1 });

      expect(socket.join).toHaveBeenCalledWith('client:1');
      expect(socket.emit).toHaveBeenCalledWith('trainer:watching', {
        clientId: 1,
      });
      expect(socket.emit).not.toHaveBeenCalledWith(
        'workout:snapshot',
        expect.anything(),
      );
    });

    it('should throw WsException for non-TRAINER', async () => {
      const socket = createMockSocket({
        id: 1,
        email: 'c@test.com',
        role: Role.CLIENT,
      });

      await expect(
        gateway.handleTrainerWatch(socket as any, { clientId: 1 }),
      ).rejects.toThrow(WsException);
    });

    it('should throw WsException for invalid clientId', async () => {
      const socket = createMockSocket({
        id: 99,
        email: 'trainer@test.com',
        role: Role.TRAINER,
      });

      await expect(
        gateway.handleTrainerWatch(socket as any, { clientId: NaN }),
      ).rejects.toThrow(WsException);
    });

    it('should throw WsException if no ACTIVE relation in DB', async () => {
      const socket = createMockSocket({
        id: 99,
        email: 'trainer@test.com',
        role: Role.TRAINER,
      });
      mockPrisma.trainerClient.findUnique.mockResolvedValue(null);

      await expect(
        gateway.handleTrainerWatch(socket as any, { clientId: 1 }),
      ).rejects.toThrow(WsException);
    });

    it('should throw WsException if relation exists but is not ACTIVE', async () => {
      const socket = createMockSocket({
        id: 99,
        email: 'trainer@test.com',
        role: Role.TRAINER,
      });
      mockPrisma.trainerClient.findUnique.mockResolvedValue({
        status: 'PENDING',
      });

      await expect(
        gateway.handleTrainerWatch(socket as any, { clientId: 1 }),
      ).rejects.toThrow(WsException);
    });
  });
});
