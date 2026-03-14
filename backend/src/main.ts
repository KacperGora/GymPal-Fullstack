import 'dotenv/config';
// Import Sentry instrumentation first
import './instrument';
import { execSync } from 'child_process';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('Running database migrations...');
    const backendDir = path.resolve(__dirname, '..');
    logger.log(`Backend dir: ${backendDir}`);
    const result = execSync('npx prisma migrate deploy', {
      cwd: backendDir,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL ?? '',
      },
    });
    logger.log(`Migration output: ${result.toString()}`);
    logger.log('Migrations completed successfully');
  } catch (error: any) {
    const stdout =
      error.stdout instanceof Buffer
        ? error.stdout.toString()
        : (error.stdout ?? 'no stdout');
    const stderr =
      error.stderr instanceof Buffer
        ? error.stderr.toString()
        : (error.stderr ?? 'no stderr');
    logger.error(`Migration failed: ${stdout}`);
    logger.error(`Migration stderr: ${stderr}`);
    logger.error(`Migration error message: ${error.message ?? 'unknown'}`);
    process.exit(1);
  }

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
void bootstrap();
