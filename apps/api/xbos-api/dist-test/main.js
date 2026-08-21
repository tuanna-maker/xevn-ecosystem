"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./load-env");
const platform_core_1 = require("@xevn/platform-core");
const xbos_cors_1 = require("./common/xbos-cors");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/http-exception.filter");
const platform_runtime_1 = require("./platform/platform-runtime");
const legal_entity_enrich_pipe_1 = require("./org-foundation/pipes/legal-entity-enrich.pipe");
async function bootstrap() {
    await (0, platform_core_1.startPlatformTracing)('xbos-api');
    (0, platform_core_1.assertProductionEnvOrExit)('xbos-api');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.enableCors((0, xbos_cors_1.resolveXbosCorsOptions)());
    app.setGlobalPrefix('api/xbos');
    // Enrich legal-entity body before ValidationPipe (pipe order + OrgFoundationModule middleware).
    app.useGlobalPipes(new legal_entity_enrich_pipe_1.LegalEntityEnrichPipe(), new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.GlobalHttpExceptionFilter());
    app.use((req, res, next) => {
        (0, platform_runtime_1.registerXbosPlatformMiddleware)(req, res, () => {
            (0, platform_runtime_1.xbosMetricsOnFinish)(req, res);
            next();
        });
    });
    app.use(platform_runtime_1.xbosRateLimitMiddleware);
    const port = Number(process.env.XBOS_BE_PORT ?? process.env.PORT ?? 3002);
    await app.listen(port);
}
bootstrap();
