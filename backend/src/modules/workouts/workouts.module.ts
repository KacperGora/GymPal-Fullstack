import { Module } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { ExercisesController } from './exercises.controller';

@Module({
  providers: [WorkoutsService],
  controllers: [WorkoutsController, ExercisesController],
})
export class WorkoutsModule {}
