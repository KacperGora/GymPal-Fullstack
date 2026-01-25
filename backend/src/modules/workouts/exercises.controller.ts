import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private workoutsService: WorkoutsService) {}

  @Get()
  findAllExercises(@Query('category') category?: string) {
    if (category) {
      return this.workoutsService.findExercisesByCategory(category);
    }
    return this.workoutsService.findAllExercises();
  }

  @Get(':id')
  findOneExercise(@Param('id') id: string) {
    return this.workoutsService.findExerciseById(id);
  }
}
