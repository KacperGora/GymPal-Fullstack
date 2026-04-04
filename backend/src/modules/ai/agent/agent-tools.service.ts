import { Injectable } from '@nestjs/common';
import type OpenAI from 'openai';
import { WorkoutsService } from '../../workouts/workouts.service';
import { MealsService } from '../../meals/meals.service';
import { WgerService } from '../../exercises/wger.service';

export const AGENT_TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_training_history',
      description:
        "Retrieves the user's workout/training history. Can filter by date range and limit results. Returns workout sessions with exercises, sets, reps, and weights.",
      parameters: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description:
              'Filter sessions from this date (ISO format: YYYY-MM-DD). Optional.',
          },
          endDate: {
            type: 'string',
            description:
              'Filter sessions until this date (ISO format: YYYY-MM-DD). Optional.',
          },
          limit: {
            type: 'number',
            description:
              'Maximum number of sessions to return. Defaults to 10.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_plan',
      description:
        'Creates a new workout session/plan for the user. Use this when the user wants to schedule training, add a workout, or record a session. Call search_exercises first to get valid wgerExerciseId values.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description:
              'Workout session name (e.g. "Chest Day", "Full Body Workout").',
          },
          date: {
            type: 'string',
            description:
              'Date for the workout in ISO format (YYYY-MM-DD). Defaults to today.',
          },
          duration: {
            type: 'number',
            description: 'Estimated duration in minutes.',
          },
          caloriesBurned: {
            type: 'number',
            description: 'Estimated calories burned. Defaults to 0.',
          },
          notes: {
            type: 'string',
            description: 'Optional notes or instructions for the workout.',
          },
          exercises: {
            type: 'array',
            description: 'List of exercises to include in the session.',
            items: {
              type: 'object',
              properties: {
                wgerExerciseId: {
                  type: 'number',
                  description:
                    'WGER exercise ID from search_exercises. Must be a positive integer obtained from search_exercises results.',
                },
                exerciseName: { type: 'string', description: 'Exercise name.' },
                exerciseCategory: {
                  type: 'string',
                  description: 'Exercise category (optional).',
                },
                sets: { type: 'number', description: 'Number of sets.' },
                reps: { type: 'number', description: 'Reps per set.' },
                weight: {
                  type: 'number',
                  description: 'Weight in kg. Use 0 for bodyweight.',
                },
                restTime: {
                  type: 'number',
                  description: 'Rest time between sets in seconds.',
                },
                notes: {
                  type: 'string',
                  description: 'Exercise-specific notes (optional).',
                },
              },
              required: ['exerciseName', 'sets', 'reps', 'weight', 'restTime'],
            },
          },
        },
        required: ['name', 'duration'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_exercises',
      description:
        'Searches the exercise database for exercises by name or keyword. Returns exercise details including ID, description, target muscles, and equipment. Use the returned ID in update_plan.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Search term (e.g. "bench press", "squat", "bicep curl").',
          },
          language: {
            type: 'string',
            description:
              'Language for results: "en" (English) or "pl" (Polish). Defaults to "en".',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return. Defaults to 5.',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_meal',
      description:
        'Logs a meal entry for the user with nutritional information. Use this when the user wants to record food they ate. Estimate macros if exact values are unknown.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the meal or food item.',
          },
          calories: {
            type: 'number',
            description: 'Total calories in the meal.',
          },
          proteins: {
            type: 'number',
            description: 'Protein content in grams.',
          },
          carbs: {
            type: 'number',
            description: 'Carbohydrate content in grams.',
          },
          fats: { type: 'number', description: 'Fat content in grams.' },
          category: {
            type: 'string',
            enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'],
            description: 'Meal category. Defaults to SNACK.',
          },
          date: {
            type: 'string',
            description:
              'Date and time for the meal in ISO format. Defaults to now.',
          },
        },
        required: ['name', 'calories', 'proteins', 'carbs', 'fats'],
      },
    },
  },
];

type ToolInput = Record<string, unknown>;

interface TrainingHistoryInput {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

interface UpdatePlanInput {
  name: string;
  date?: string;
  duration: number;
  caloriesBurned?: number;
  notes?: string;
  exercises?: {
    wgerExerciseId?: number;
    exerciseName: string;
    exerciseCategory?: string;
    sets: number;
    reps: number;
    weight: number;
    restTime: number;
    notes?: string;
  }[];
}

interface SearchExercisesInput {
  query: string;
  language?: string;
  limit?: number;
}

interface LogMealInput {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  category?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  date?: string;
}

const TRAINING_HISTORY_DEFAULT_LIMIT = 10;
const TRAINING_HISTORY_MAX_LIMIT = 100;
const SEARCH_EXERCISES_DEFAULT_LIMIT = 5;
const SEARCH_EXERCISES_MAX_LIMIT = 10;

function clampLimit(
  value: number | undefined,
  defaultLimit: number,
  maxLimit: number,
): number {
  if (!Number.isFinite(value)) return defaultLimit;
  const clamped = Math.trunc(value as number);
  if (clamped < 1) return 1;
  return Math.min(clamped, maxLimit);
}

@Injectable()
export class AgentToolsService {
  constructor(
    private readonly workoutsService: WorkoutsService,
    private readonly mealsService: MealsService,
    private readonly wgerService: WgerService,
  ) {}

  async executeTool(
    userId: number,
    toolName: string,
    input: ToolInput,
  ): Promise<unknown> {
    switch (toolName) {
      case 'get_training_history':
        return this.getTrainingHistory(
          userId,
          input as unknown as TrainingHistoryInput,
        );
      case 'update_plan':
        return this.updatePlan(userId, input as unknown as UpdatePlanInput);
      case 'search_exercises':
        return this.searchExercises(input as unknown as SearchExercisesInput);
      case 'log_meal':
        return this.logMeal(userId, input as unknown as LogMealInput);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async getTrainingHistory(
    userId: number,
    input: TrainingHistoryInput,
  ) {
    const result = await this.workoutsService.findAllWorkoutSessions(userId, {
      startDate: input.startDate,
      endDate: input.endDate,
      limit: clampLimit(
        input.limit,
        TRAINING_HISTORY_DEFAULT_LIMIT,
        TRAINING_HISTORY_MAX_LIMIT,
      ),
      page: 1,
    });

    return {
      sessions: result.data,
      total: result.total,
      fetched: result.data.length,
    };
  }

  private async updatePlan(userId: number, input: UpdatePlanInput) {
    const exercises = (input.exercises ?? []).map((ex) => {
      if (ex.wgerExerciseId !== undefined && ex.wgerExerciseId < 1) {
        throw new Error(
          `Invalid wgerExerciseId for exercise "${ex.exerciseName}": must be a positive integer from search_exercises.`,
        );
      }
      return {
        wgerExerciseId: ex.wgerExerciseId as number,
        exerciseName: ex.exerciseName,
        exerciseCategory: ex.exerciseCategory,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        restTime: ex.restTime,
        notes: ex.notes,
      };
    });

    const session = await this.workoutsService.createWorkoutSession(userId, {
      name: input.name,
      date: input.date ?? new Date().toISOString(),
      duration: input.duration,
      caloriesBurned: input.caloriesBurned ?? 0,
      notes: input.notes,
      exercises,
    });

    return {
      created: true,
      sessionId: session.id,
      name: session.name,
      date: session.date,
      exerciseCount: session.exercises?.length ?? 0,
    };
  }

  private async searchExercises(input: SearchExercisesInput) {
    const exercises = await this.wgerService.searchExercises(
      input.query,
      clampLimit(
        input.limit,
        SEARCH_EXERCISES_DEFAULT_LIMIT,
        SEARCH_EXERCISES_MAX_LIMIT,
      ),
      input.language ?? 'en',
    );

    return exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      description: ex.description,
      category: ex.category,
      muscles: ex.muscles,
      equipment: ex.equipment,
    }));
  }

  private async logMeal(userId: number, input: LogMealInput) {
    const meal = await this.mealsService.create(userId, {
      name: input.name,
      calories: input.calories,
      proteins: input.proteins,
      carbs: input.carbs,
      fats: input.fats,
      category: input.category ?? 'SNACK',
      date: input.date ?? new Date().toISOString(),
    });

    return {
      logged: true,
      mealId: meal.id,
      name: meal.name,
      calories: meal.calories,
      category: meal.category,
    };
  }
}
