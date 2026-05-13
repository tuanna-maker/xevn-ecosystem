import './load-env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/xbos');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    const startedAt = Date.now();
    res.setHeader('x-request-id', requestId);
    res.on('finish', () => {
      const elapsedMs = Date.now() - startedAt;
      if (elapsedMs >= 500) {
        // Slow-request telemetry baseline for Gate D.
        console.warn(
          `[xbos-api][slow-request] ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedMs}ms requestId=${requestId}`,
        );
      }
    });
    next();
  });
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
