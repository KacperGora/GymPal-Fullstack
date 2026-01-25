import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import {
  CreateWorkoutSessionDto,
  UpdateWorkoutSessionDto,
  CreateWorkoutExerciseDto,
  UpdateWorkoutExerciseDto,
  WorkoutQueryDto,
  exerciseCategoryEnum,
} from '@gympal/shared';
import { ExerciseCategory } from '../../generated/prisma/enums';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  // ========== Exercise Library Methods (Read-Only) ==========

  async findAllExercises() {
    return this.prisma.exercise.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findExerciseById(id: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return exercise;
  }

  async findExercisesByCategory(category: string) {
    const parsed = exerciseCategoryEnum.safeParse(category);
    if (!parsed.success) {
      throw new BadRequestException('Invalid exercise category');
    }
    return this.prisma.exercise.findMany({
      where: { category: parsed.data as ExerciseCategory },
      orderBy: { name: 'asc' },
    });
  }

  // ========== WorkoutSession CRUD Methods ==========

  async createWorkoutSession(userId: number, dto: CreateWorkoutSessionDto) {
    const { exercises, ...workoutData } = dto;

    if (exercises && exercises.length > 0) {
      const exerciseIds = exercises.map((e) => e.exerciseId);
      const existingExercises = await this.prisma.exercise.findMany({
        where: { id: { in: exerciseIds } },
      });

      if (existingExercises.length !== exerciseIds.length) {
        throw new BadRequestException('One or more exercise IDs are invalid');
      }
    }

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
        exercises: {
          include: {
            exercise: true,
          },
        },
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
        exercises: {
          include: {
            exercise: true,
          },
        },
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
          include: {
            exercise: true,
          },
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
    await this.findExerciseById(dto.exerciseId);

    const workoutExercise = await this.prisma.workoutExercise.create({
      data: {
        ...dto,
        workoutSessionId: workoutId,
      },
      include: {
        exercise: true,
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

    if (dto.exerciseId) {
      await this.findExerciseById(dto.exerciseId);
    }

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
      include: {
        exercise: true,
      },
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
