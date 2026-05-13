import './load-env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = Number(process.env.HRM_RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.HRM_RATE_LIMIT_MAX ?? 300);
const requestBuckets = new Map<string, { count: number; windowStart: number }>();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api/hrm');
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
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('x-frame-options', 'SAMEORIGIN');
    res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'content-security-policy',
      "default-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
    );
    const now = Date.now();
    const requestIp =
      req.ip ??
      (typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'] : undefined) ??
      'unknown';
    const bucket = requestBuckets.get(requestIp);
    if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
      requestBuckets.set(requestIp, { count: 1, windowStart: now });
      next();
      return;
    }
    bucket.count += 1;
    if (bucket.count > MAX_REQUESTS) {
      res.status(429).json({
        success: false,
        code: 'HRM-RATE-429',
        message: 'Too many requests',
        data: {
          retry_after_ms: Math.max(0, WINDOW_MS - (now - bucket.windowStart)),
        },
      });
      return;
    }
    next();
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
