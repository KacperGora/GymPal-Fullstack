import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/db/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { MealsModule } from './modules/meals/meals.module';

@Module({
  imports: [PrismaModule, AuthModule, MealsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
