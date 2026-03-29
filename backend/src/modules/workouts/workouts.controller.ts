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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
import { OwnershipGuard } from '../../shared/guards/ownership.guard';

@ApiTags('workouts')
@ApiBearerAuth()
@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workout session' })
  @ApiResponse({
    status: 201,
    description: 'Workout session created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createWorkout(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(createWorkoutSessionSchema))
    dto: CreateWorkoutSessionDto,
  ) {
    return this.workoutsService.createWorkoutSession(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workout sessions' })
  @ApiResponse({ status: 200, description: 'Returns list of workout sessions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(OwnershipGuard)
  findAllWorkouts(
    @RequestUser('id') userId: number,
    @Query('clientId') clientId: string,
    @Query(new ZodValidationPipe(workoutQuerySchema)) query?: WorkoutQueryDto,
  ) {
    const targetUserId = clientId ? parseInt(clientId, 10) : userId;
    return this.workoutsService.findAllWorkoutSessions(targetUserId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific workout session' })
  @ApiResponse({ status: 200, description: 'Returns workout session details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  findOneWorkout(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.workoutsService.findWorkoutSessionById(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workout session' })
  @ApiResponse({
    status: 200,
    description: 'Workout session updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  updateWorkout(
    @RequestUser('id') userId: number,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateWorkoutSessionSchema))
    dto: UpdateWorkoutSessionDto,
  ) {
    return this.workoutsService.updateWorkoutSession(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workout session' })
  @ApiResponse({
    status: 200,
    description: 'Workout session deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  removeWorkout(@RequestUser('id') userId: number, @Param('id') id: string) {
    return this.workoutsService.deleteWorkoutSession(userId, id);
  }

  @Post(':workoutId/exercises')
  @ApiOperation({ summary: 'Add an exercise to a workout' })
  @ApiResponse({ status: 201, description: 'Exercise added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  addExerciseToWorkout(
    @RequestUser('id') userId: number,
    @Param('workoutId') workoutId: string,
    @Body(new ZodValidationPipe(createWorkoutExerciseSchema))
    dto: CreateWorkoutExerciseDto,
  ) {
    return this.workoutsService.addExerciseToWorkout(userId, workoutId, dto);
  }

  @Patch(':workoutId/exercises/:exerciseId')
  @ApiOperation({ summary: 'Update an exercise in a workout' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise or workout not found' })
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
  @ApiOperation({ summary: 'Remove an exercise from a workout' })
  @ApiResponse({ status: 200, description: 'Exercise removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise or workout not found' })
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

  @Get('stats/weekly')
  @ApiOperation({ summary: 'Get weekly workout statistics' })
  @ApiResponse({ status: 200, description: 'Returns weekly workout stats' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWeeklyStats(@RequestUser('id') userId: number) {
    return this.workoutsService.getWeeklyStats(userId);
  }
}
