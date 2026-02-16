import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/db/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { CorrelationIdMiddleware } from './middlewares/correlation-id.middleware';
import { MealsModule } from './modules/meals/meals.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { WaterModule } from './modules/water/water.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { HealthModule } from './modules/health/health.module';
import { AiModule } from './modules/ai/ai.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { LoggerModule } from './shared/sentry/logger.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    MealsModule,
    NutritionModule,
    UserProfileModule,
    WorkoutsModule,
    WaterModule,
    FavoritesModule,
    ExercisesModule,
    HealthModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, LoggingMiddleware).forRoutes('*');
  }
}
