import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/db/prisma.module';
import { RedisModule } from './shared/redis/redis.module';
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
import { JobsModule } from './modules/jobs/jobs.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { LoggerModule } from './shared/sentry/logger.module';
import { TrainerClientModule } from './modules/trainer-client/trainer-client.module';
import { AdminModule } from './modules/admin/admin.module';
import { WorkoutGatewayModule } from './modules/workout-gateway/workout-gateway.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    LoggerModule,
    RedisModule,
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
    JobsModule,
    StripeModule,
    SubscriptionsModule,
    TrainerClientModule,
    AdminModule,
    WorkoutGatewayModule,
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
