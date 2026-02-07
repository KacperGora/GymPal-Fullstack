import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import {
  CreateWorkoutSessionDto,
  UpdateWorkoutSessionDto,
  CreateWorkoutExerciseDto,
  UpdateWorkoutExerciseDto,
  WorkoutQueryDto,
} from '@gympal/shared';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

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

    return workout;
  }

  async findAllWorkoutSessions(userId: number, query?: WorkoutQueryDto) {
    const where: any = { userId };

    if (query?.startDate || query?.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    return this.prisma.workoutSession.findMany({
      where,
      include: {
        exercises: true,
      },
      orderBy: { date: 'desc' },
      take: query?.limit ?? 50,
    });
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
}
