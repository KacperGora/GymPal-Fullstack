import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../shared/db/prisma.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import type { EmbeddingSourceType } from './rag.interfaces';

export interface WorkoutCreatedEvent {
  userId: number;
  sessionId: string;
}

export interface MealCreatedEvent {
  userId: number;
  mealId: string;
}

@Injectable()
export class EmbeddingIndexerService {
  private readonly logger = new Logger(EmbeddingIndexerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  @OnEvent('workout.created', { async: true })
  async handleWorkoutCreated(event: WorkoutCreatedEvent): Promise<void> {
    try {
      const session = await this.prisma.workoutSession.findUnique({
        where: { id: event.sessionId },
        include: { exercises: true },
      });

      if (!session) return;

      const content = this.serializeWorkout(session);
      await this.indexContent(
        event.userId,
        'workout_session',
        event.sessionId,
        content,
        { date: session.date.toISOString(), name: session.name },
      );

      this.logger.debug(
        `Indexed workout session ${event.sessionId} for user ${event.userId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to index workout ${event.sessionId}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  @OnEvent('meal.created', { async: true })
  async handleMealCreated(event: MealCreatedEvent): Promise<void> {
    try {
      const meal = await this.prisma.meal.findUnique({
        where: { id: event.mealId },
      });

      if (!meal) return;

      const content = this.serializeMeal(meal);
      await this.indexContent(event.userId, 'meal', event.mealId, content, {
        date: meal.date.toISOString(),
        category: meal.category,
        calories: meal.calories,
      });

      this.logger.debug(
        `Indexed meal ${event.mealId} for user ${event.userId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to index meal ${event.mealId}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async indexContent(
    userId: number,
    sourceType: EmbeddingSourceType,
    sourceId: string,
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const embedding = await this.embeddingService.embed(content);
    await this.vectorStore.upsert(
      { userId, sourceType, sourceId, content, metadata },
      embedding,
    );
  }

  private serializeWorkout(session: {
    name: string;
    date: Date;
    duration: number;
    caloriesBurned: number;
    notes?: string | null;
    exercises: Array<{
      exerciseName: string;
      sets: number;
      reps: number;
      weight: number;
      notes?: string | null;
    }>;
  }): string {
    const dateStr = session.date.toISOString().split('T')[0];
    const exerciseParts = session.exercises.map(
      (ex) =>
        `${ex.exerciseName} ${ex.sets}x${ex.reps}${ex.weight > 0 ? `@${ex.weight}kg` : ' (bodyweight)'}`,
    );
    const parts = [
      `${session.name} (${dateStr})`,
      `Czas: ${session.duration} min`,
    ];
    if (session.caloriesBurned > 0) {
      parts.push(`Spalone kalorie: ${session.caloriesBurned} kcal`);
    }
    if (exerciseParts.length > 0) {
      parts.push(`Ćwiczenia: ${exerciseParts.join(', ')}`);
    }
    if (session.notes) {
      parts.push(`Uwagi: ${session.notes}`);
    }
    return parts.join(' | ');
  }

  private serializeMeal(meal: {
    name: string;
    category: string;
    date: Date;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  }): string {
    const dateStr = meal.date.toISOString().split('T')[0];
    return [
      `${meal.name} (${meal.category}, ${dateStr})`,
      `${meal.calories} kcal`,
      `Białko: ${meal.proteins}g`,
      `Węglowodany: ${meal.carbs}g`,
      `Tłuszcze: ${meal.fats}g`,
    ].join(' | ');
  }
}
