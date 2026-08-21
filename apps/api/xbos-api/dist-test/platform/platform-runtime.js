"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xbosRootLogger = exports.XBOS_SERVICE_NAME = void 0;
exports.registerXbosPlatformMiddleware = registerXbosPlatformMiddleware;
exports.xbosRateLimitMiddleware = xbosRateLimitMiddleware;
exports.xbosMetricsOnFinish = xbosMetricsOnFinish;
const platform_core_1 = require("@xevn/platform-core");
exports.XBOS_SERVICE_NAME = 'xbos-api';
exports.xbosRootLogger = (0, platform_core_1.createPlatformLogger)({ service: exports.XBOS_SERVICE_NAME });
const rateLimit = (0, platform_core_1.createRateLimitMiddleware)({
    max: Number(process.env.XBOS_RATE_LIMIT_MAX ?? process.env.RATE_LIMIT_MAX ?? 300),
    windowMs: Number(process.env.XBOS_RATE_LIMIT_WINDOW_MS ?? process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
});
function registerXbosPlatformMiddleware(req, res, next) {
    (0, platform_core_1.applyRequestContextMiddleware)(req, res, exports.xbosRootLogger);
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('x-frame-options', 'SAMEORIGIN');
    res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
    res.setHeader('content-security-policy', "default-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
    next();
}
async function xbosRateLimitMiddleware(req, res, next) {
    const allowed = await rateLimit(req, res);
    if (allowed)
        next();
}
function xbosMetricsOnFinish(req, res) {
    const startedAt = Date.now();
    res.on('finish', () => {
        const route = req.route?.path ?? req.path ?? req.url ?? 'unknown';
        (0, platform_core_1.recordHttpMetrics)(exports.XBOS_SERVICE_NAME, {
            method: req.method ?? 'GET',
            route,
            status: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });
}
