import './load-env';
import {
  assertProductionEnvOrExit,
  resolveCorsOptions,
  startPlatformTracing,
} from '@xevn/platform-core';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { idempotencyMiddleware } from './common/idempotency.middleware';
import { useRedisIoAdapter } from './realtime/redis-io.adapter';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';
import { NextFunction, Request, Response } from 'express';
import { normalizeAuthorizationHeaderInPlace } from './common/internal-auth';
import {
  hrmMetricsOnFinish,
  hrmRateLimitMiddleware,
  registerHrmPlatformMiddleware,
} from './platform/platform-runtime';

async function bootstrap() {
  await startPlatformTracing('hrm-api');
  assertProductionEnvOrExit('hrm-api');

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await useRedisIoAdapter(app);
  app.enableCors(resolveCorsOptions());
  app.setGlobalPrefix('api/hrm');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    normalizeAuthorizationHeaderInPlace(req.headers as Record<string, unknown>);
    next();
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    registerHrmPlatformMiddleware(req, res, () => {
      hrmMetricsOnFinish(req, res);
      next();
    });
  });
  app.use(hrmRateLimitMiddleware);
  app.use(idempotencyMiddleware);
  const port = Number(process.env.HRM_BE_PORT ?? process.env.PORT ?? 3001);
  await app.listen(port);
}
bootstrap();
