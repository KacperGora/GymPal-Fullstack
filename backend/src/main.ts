import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const corsOrigins = process.env.CORS_ORIGIN?.split(',') ?? [
    'http://localhost:3000',
  ];
  logger.log(`CORS origins: ${corsOrigins.join(', ')}`);

  const isProduction = process.env.NODE_ENV === 'production';

  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: isProduction
          ? {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'"],
              imgSrc: ["'self'", 'data:'],
              connectSrc: ["'self'", 'https://api.wger.de'],
              fontSrc: ["'self'"],
              frameSrc: ["'none'"],
              formAction: ["'self'"],
              upgradeInsecureRequests: [],
            }
          : {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'", 'https:', 'http://localhost:3000'],
              fontSrc: ["'self'", 'data:', 'https:'],
              frameSrc: ["'self'"],
              formAction: ["'self'"],
            },
      },
    }),
  );
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('GymPal API')
      .setDescription('Fitness tracking API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
