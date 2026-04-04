import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../shared/db/prisma.service';
import type { Prisma } from '../../generated/prisma/client';
import {
  CreateWorkoutSessionDto,
  UpdateWorkoutSessionDto,
  CreateWorkoutExerciseDto,
  UpdateWorkoutExerciseDto,
  WorkoutQueryDto,
} from '@gympal/shared';
import {
  getPaginationParams,
  buildPaginatedResponse,
} from '../../shared/lib/pagination';

@Injectable()
export class WorkoutsService {
  constructor(
    private prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ========== WorkoutSession CRUD Methods ==========

  async createWorkoutSession(userId: number, dto: CreateWorkoutSessionDto) {
    const { exercises, ...workoutData } = dto;

    const workout = await this.prisma.workoutSession.create({
      data: {
        ...workoutData,
        userId,
        exercises: exercises
          ? {
              create: exercises,
            }
          : undefined,
      },
      include: {
        exercises: true,
      },
    });

    this.eventEmitter.emit('workout.created', {
      userId,
      sessionId: workout.id,
    });

    return workout;
  }

  async findAllWorkoutSessions(userId: number, query?: WorkoutQueryDto) {
    const where: Prisma.WorkoutSessionWhereInput = { userId };

    if (query?.startDate || query?.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    const { page, limit, skip } = getPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.workoutSession.findMany({
        where,
        include: {
          exercises: true,
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.workoutSession.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findWorkoutSessionById(userId: number, id: string) {
    const workout = await this.prisma.workoutSession.findFirst({
      where: { id, userId },
      include: {
        exercises: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return workout;
  }

  async updateWorkoutSession(
    userId: number,
    id: string,
    dto: UpdateWorkoutSessionDto,
  ) {
    const updated = await this.prisma.workoutSession.updateMany({
      where: { userId, id },
      data: dto,
    });

    if (updated.count === 0) {
      throw new NotFoundException('Workout not found');
    }

    return this.findWorkoutSessionById(userId, id);
  }

  async deleteWorkoutSession(userId: number, id: string) {
    const deleted = await this.prisma.workoutSession.deleteMany({
      where: { userId, id },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Workout not found or not owned by user');
    }

    return { id };
  }

  async addExerciseToWorkout(
    userId: number,
    workoutId: string,
    dto: CreateWorkoutExerciseDto,
  ) {
    await this.findWorkoutSessionById(userId, workoutId);

    const workoutExercise = await this.prisma.workoutExercise.create({
      data: {
        ...dto,
        workoutSessionId: workoutId,
      },
    });

    return workoutExercise;
  }

  async updateWorkoutExercise(
    userId: number,
    workoutId: string,
    exerciseId: string,
    dto: UpdateWorkoutExerciseDto,
  ) {
    await this.findWorkoutSessionById(userId, workoutId);

    const workoutExercise = await this.prisma.workoutExercise.findFirst({
      where: {
        id: exerciseId,
        workoutSessionId: workoutId,
      },
    });

    if (!workoutExercise) {
      throw new NotFoundException('Exercise not found in this workout');
    }

    const updated = await this.prisma.workoutExercise.update({
      where: { id: exerciseId },
      data: dto,
    });

    return updated;
  }

  async removeExerciseFromWorkout(
    userId: number,
    workoutId: string,
    exerciseId: string,
  ) {
    await this.findWorkoutSessionById(userId, workoutId);

    const deleted = await this.prisma.workoutExercise.deleteMany({
      where: {
        id: exerciseId,
        workoutSessionId: workoutId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Exercise not found in this workout');
    }

    return { id: exerciseId };
  }

  async getWeeklyStats(userId: number) {
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56); // 8 weeks = 56 days

    const workouts = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        date: {
          gte: eightWeeksAgo,
        },
      },
      select: {
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group workouts by week
    const weeklyData = new Map<string, number>();

    workouts.forEach((workout) => {
      const date = new Date(workout.date);
      // Get the Monday of the week
      const monday = new Date(date);
      const day = monday.getDay();
      const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);

      const weekKey = monday.toISOString().split('T')[0];
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + 1);
    });

    // Generate last 8 weeks with 0 for weeks with no workouts
    const result = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);

      const weekKey = date.toISOString().split('T')[0];
      result.push({
        week: weekKey,
        workouts: weeklyData.get(weekKey) || 0,
      });
    }

    return result;
  }
}
