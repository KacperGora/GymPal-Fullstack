import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/db/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { MealsModule } from './modules/meals/meals.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MealsModule,
    NutritionModule,
    UserProfileModule,
    WorkoutsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
