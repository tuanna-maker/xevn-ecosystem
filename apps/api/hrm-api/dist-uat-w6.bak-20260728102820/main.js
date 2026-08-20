"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./load-env");
const platform_core_1 = require("@xevn/platform-core");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const idempotency_middleware_1 = require("./common/idempotency.middleware");
const redis_io_adapter_1 = require("./realtime/redis-io.adapter");
const http_exception_filter_1 = require("./common/http-exception.filter");
const internal_auth_1 = require("./common/internal-auth");
const platform_runtime_1 = require("./platform/platform-runtime");
async function bootstrap() {
    await (0, platform_core_1.startPlatformTracing)('hrm-api');
    (0, platform_core_1.assertProductionEnvOrExit)('hrm-api');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    await (0, redis_io_adapter_1.useRedisIoAdapter)(app);
    app.enableCors((0, platform_core_1.resolveCorsOptions)());
    app.setGlobalPrefix('api/hrm');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.GlobalHttpExceptionFilter());
    app.use((req, _res, next) => {
        (0, internal_auth_1.normalizeAuthorizationHeaderInPlace)(req.headers);
        next();
    });
    app.use((req, res, next) => {
        (0, platform_runtime_1.registerHrmPlatformMiddleware)(req, res, () => {
            (0, platform_runtime_1.hrmMetricsOnFinish)(req, res);
            next();
        });
    });
    app.use(platform_runtime_1.hrmRateLimitMiddleware);
    app.use(idempotency_middleware_1.idempotencyMiddleware);
    const port = Number(process.env.HRM_BE_PORT ?? process.env.PORT ?? 3001);
    await app.listen(port);
    const httpServer = app.getHttpServer();
    const keepAliveMs = Number(process.env.HTTP_KEEPALIVE_TIMEOUT_MS ?? 65_000);
    const headersMs = Number(process.env.HTTP_HEADERS_TIMEOUT_MS ?? Math.max(keepAliveMs + 5_000, 70_000));
    httpServer.keepAliveTimeout = keepAliveMs;
    httpServer.headersTimeout = headersMs;
}
bootstrap();
//# sourceMappingURL=main.js.map