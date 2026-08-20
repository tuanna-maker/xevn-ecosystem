import type { Logger } from 'pino';
import type { NextFunction, Request, Response } from 'express';
export declare const HRM_SERVICE_NAME = "hrm-api";
export declare const hrmRootLogger: Logger;
export declare function registerHrmPlatformMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function hrmRateLimitMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function hrmMetricsOnFinish(req: Request, res: Response): void;
