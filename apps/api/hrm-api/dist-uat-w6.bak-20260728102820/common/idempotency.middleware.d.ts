import type { NextFunction, Request, Response } from 'express';
export declare function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): void;
