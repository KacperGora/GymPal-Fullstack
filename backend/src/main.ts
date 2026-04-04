import 'dotenv/config';
import './otel';
// Import Sentry instrumentation first
import './instrument';
import { execSync } from 'child_process';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function runMigrations(logger: Logger): void {
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
  } catch (error: unknown) {
    const err = error as {
      stdout?: Buffer | string;
      stderr?: Buffer | string;
      message?: string;
    };

    const stdout =
      err.stdout instanceof Buffer
        ? err.stdout.toString()
        : (err.stdout ?? 'no stdout');
    const stderr =
      err.stderr instanceof Buffer
        ? err.stderr.toString()
        : (err.stderr ?? 'no stderr');

    logger.error(`Migration failed: ${String(stdout)}`);
    logger.error(`Migration stderr: ${String(stderr)}`);
    logger.error(`Migration error message: ${err.message ?? 'unknown'}`);
    process.exit(1);
  }
}

function setupSecurity(app: INestApplication, isProduction: boolean): void {
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
}

function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('GymPal API')
    .setDescription('Fitness tracking API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production';

  runMigrations(logger);

  const app: INestApplication = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const corsOrigins = process.env.CORS_ORIGIN?.split(',') ?? [
    'http://localhost:3000',
  ];
  logger.log(`CORS origins: ${corsOrigins.join(', ')}`);

  setupSecurity(app, isProduction);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  if (!isProduction) {
    setupSwagger(app);
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
