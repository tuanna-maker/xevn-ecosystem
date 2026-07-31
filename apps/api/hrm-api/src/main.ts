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
  hrmMobileEssConnectionGuard,
  hrmRateLimitMiddleware,
  registerHrmPlatformMiddleware,
} from './platform/platform-runtime';

async function bootstrap() {
  await startPlatformTracing('hrm-api');
  assertProductionEnvOrExit('hrm-api');

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await useRedisIoAdapter(app);
  const pilotUatAuth =
    process.env.HRM_PILOT_UAT_AUTH_ENABLED?.trim().toLowerCase() === 'true';
  app.enableCors(
    pilotUatAuth ? { origin: true, credentials: true } : resolveCorsOptions(),
  );
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
  app.use(hrmMobileEssConnectionGuard);
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
  // Align Nest HTTP keepalive with nginx upstream keepalive_timeout (60s).
  // Node default keepAliveTimeout=5s causes RST on idle reuse → client status=0
  // under sustained hold (P1-HRM-SCALE-DO-W3-HOLD-ERRBUDGET). Nest must outlive nginx.
  const httpServer = app.getHttpServer();
  const keepAliveMs = Number(process.env.HTTP_KEEPALIVE_TIMEOUT_MS ?? 65_000);
  const headersMs = Number(
    process.env.HTTP_HEADERS_TIMEOUT_MS ?? Math.max(keepAliveMs + 5_000, 70_000),
  );
  httpServer.keepAliveTimeout = keepAliveMs;
  httpServer.headersTimeout = headersMs;
}
bootstrap();
