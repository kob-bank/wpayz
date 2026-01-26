import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  axiosLogger,
  axiosCorrelation,
  KobLogger,
  LoggerMiddleware,
} from '@kob-bank/logger';
import { setupGracefulShutdown } from '@kob-bank/common/graceful-shutdown';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new KobLogger('bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: new KobLogger(''),
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3000);

  // Logger middleware for incoming requests
  app.use(
    LoggerMiddleware([
      '/health',
      RegExp('/report/.*'),
      RegExp('/transaction/.*'),
    ]),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.enableCors();

  // Setup graceful shutdown - waits for in-flight requests before exit
  setupGracefulShutdown({
    app,
    logger,
    gracePeriodMs: 60000,
  });

  await app.listen(port);
  logger.log(`WPayz gateway is running on: http://localhost:${port}`);
}

// Setup axios interceptors for upstream logging
axiosCorrelation(axios);
axiosLogger(axios, { req: [], resp: ['qrcode'] });

bootstrap();
