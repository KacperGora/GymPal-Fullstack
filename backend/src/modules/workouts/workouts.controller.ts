import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import {
  createWorkoutSessionSchema,
  updateWorkoutSessionSchema,
  createWorkoutExerciseSchema,
  updateWorkoutExerciseSchema,
  workoutQuerySchema,
} from '@gympal/shared';
import type {
  CreateWorkoutSessionDto,
  UpdateWorkoutSessionDto,
  CreateWorkoutExerciseDto,
  UpdateWorkoutExerciseDto,
  WorkoutQueryDto,
} from '@gympal/shared';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Post()
  createWorkout(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(createWorkoutSessionSchema))
    dto: CreateWorkoutSessionDto,
  ) {
    return this.workoutsService.createWorkoutSession(userId, dto);
  }

  @Get()
  findAllWorkouts(
    @RequestUser('id') userId: number,
    @Query(new ZodValidationPipe(workoutQuerySchema)) query?: WorkoutQueryDto,
  ) {
    return this.workoutsService.findAllWorkoutSessions(userId, query);
  }

  @Get(':id')
  findOneWorkout(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.workoutsService.findWorkoutSessionById(userId, id);
  }

  @Patch(':id')
  updateWorkout(
    @RequestUser('id') userId: number,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateWorkoutSessionSchema))
    dto: UpdateWorkoutSessionDto,
  ) {
    return this.workoutsService.updateWorkoutSession(userId, id, dto);
  }

  @Delete(':id')
  removeWorkout(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.workoutsService.deleteWorkoutSession(userId, id);
  }

  @Post(':workoutId/exercises')
  addExerciseToWorkout(
    @RequestUser('id') userId: number,
    @Param('workoutId') workoutId: string,
    @Body(new ZodValidationPipe(createWorkoutExerciseSchema))
    dto: CreateWorkoutExerciseDto,
  ) {
    return this.workoutsService.addExerciseToWorkout(userId, workoutId, dto);
  }

  @Patch(':workoutId/exercises/:exerciseId')
  updateWorkoutExercise(
    @RequestUser('id') userId: number,
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Body(new ZodValidationPipe(updateWorkoutExerciseSchema))
    dto: UpdateWorkoutExerciseDto,
  ) {
    return this.workoutsService.updateWorkoutExercise(
      userId,
      workoutId,
      exerciseId,
      dto,
    );
  }

  @Delete(':workoutId/exercises/:exerciseId')
  removeExerciseFromWorkout(
    @RequestUser('id') userId: number,
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.workoutsService.removeExerciseFromWorkout(
      userId,
      workoutId,
      exerciseId,
    );
  }
}
