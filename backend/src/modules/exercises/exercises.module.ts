import { Module } from '@nestjs/common';
import { WgerService } from './wger.service';
import { FavoriteExercisesService } from './favorite-exercises.service';
import { ExercisesApiController } from './exercises-api.controller';

@Module({
  providers: [WgerService, FavoriteExercisesService],
  controllers: [ExercisesApiController],
  exports: [WgerService],
})
export class ExercisesModule {}
