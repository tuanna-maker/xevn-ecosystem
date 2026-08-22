import './load-env';
import {
  assertProductionEnvOrExit,
  startPlatformTracing,
} from '@xevn/platform-core';
import { resolveXbosCorsOptions } from './common/xbos-cors';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';
import { NextFunction, Request, Response } from 'express';
import {
  registerXbosPlatformMiddleware,
  xbosMetricsOnFinish,
  xbosRateLimitMiddleware,
} from './platform/platform-runtime';
import { LegalEntityEnrichPipe } from './org-foundation/pipes/legal-entity-enrich.pipe';

async function bootstrap() {
  await startPlatformTracing('xbos-api');
  assertProductionEnvOrExit('xbos-api');

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors(resolveXbosCorsOptions());
  app.setGlobalPrefix('api/xbos');
  // Enrich legal-entity body before ValidationPipe (pipe order + OrgFoundationModule middleware).
  app.useGlobalPipes(
    new LegalEntityEnrichPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.use((req: Request, res: Response, next: NextFunction) => {
    registerXbosPlatformMiddleware(req, res, () => {
      xbosMetricsOnFinish(req, res);
      next();
    });
  });
  app.use(xbosRateLimitMiddleware);
  const port = Number(process.env.XBOS_BE_PORT ?? process.env.PORT ?? 3002);
  await app.listen(port);
  // Match hrm-api + nginx upstream keepalive (Node default 5s → RST on idle socket reuse).
  const httpServer = app.getHttpServer();
  const keepAliveMs = Number(process.env.HTTP_KEEPALIVE_TIMEOUT_MS ?? 65_000);
  const headersMs = Number(
    process.env.HTTP_HEADERS_TIMEOUT_MS ??
      Math.max(keepAliveMs + 5_000, 70_000),
  );
  httpServer.keepAliveTimeout = keepAliveMs;
  httpServer.headersTimeout = headersMs;
}
bootstrap();
