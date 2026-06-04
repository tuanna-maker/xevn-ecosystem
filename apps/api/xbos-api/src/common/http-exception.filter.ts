import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { logHttpException } from '@xevn/platform-core';
import type { Request } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'XBOS-SYS-001';
    let message = 'Internal server error';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse() as
        | string
        | { code?: string; message?: string | string[]; details?: unknown; error?: string };
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        if ('code' in payload && payload.code) code = String(payload.code);
        if (payload.message) {
          message = Array.isArray(payload.message) ? payload.message.join('; ') : payload.message;
        } else if (payload.error) {
          message = payload.error;
        }
        details = payload.details;
      }
      if (!payload || typeof payload !== 'object' || !('code' in payload)) {
        if (status === HttpStatus.BAD_REQUEST) code = 'XBOS-VAL-001';
        if (status === HttpStatus.UNAUTHORIZED) code = 'XBOS-AUTH-001';
        if (status === HttpStatus.NOT_FOUND) code = 'XBOS-CFG-001';
        if (status === HttpStatus.FORBIDDEN) code = 'XBOS-CFG-002';
      }
    }
    if (!(exception instanceof HttpException) && exception instanceof Error) {
      message = exception.message || message;
    }

    logHttpException(request.log, {
      status,
      code,
      message,
      exception,
      method: request.method,
      path: request.url,
    });
    response.setHeader('x-api-code', code);
    response.status(status).json({
      success: false,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
