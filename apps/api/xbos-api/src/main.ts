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
import { legalEntityBodyMiddleware } from './org-foundation/middleware/legal-entity-body.middleware';

async function bootstrap() {
  await startPlatformTracing('xbos-api');
  assertProductionEnvOrExit('xbos-api');

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors(resolveXbosCorsOptions());
  app.setGlobalPrefix('api/xbos');
  // Enrich legal-entity JSON before global ValidationPipe (interceptor alone is not enough on some Nest orders).
  app.use(legalEntityBodyMiddleware);
  app.useGlobalPipes(
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
}
bootstrap();
