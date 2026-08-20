"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrmRootLogger = exports.HRM_SERVICE_NAME = void 0;
exports.registerHrmPlatformMiddleware = registerHrmPlatformMiddleware;
exports.hrmRateLimitMiddleware = hrmRateLimitMiddleware;
exports.hrmMetricsOnFinish = hrmMetricsOnFinish;
const platform_core_1 = require("@xevn/platform-core");
exports.HRM_SERVICE_NAME = 'hrm-api';
exports.hrmRootLogger = (0, platform_core_1.createPlatformLogger)({ service: exports.HRM_SERVICE_NAME });
const rateLimit = (0, platform_core_1.createRateLimitMiddleware)({
    max: Number(process.env.HRM_RATE_LIMIT_MAX ?? process.env.RATE_LIMIT_MAX ?? 300),
    windowMs: Number(process.env.HRM_RATE_LIMIT_WINDOW_MS ?? process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
});
function registerHrmPlatformMiddleware(req, res, next) {
    (0, platform_core_1.applyRequestContextMiddleware)(req, res, exports.hrmRootLogger);
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('x-frame-options', 'SAMEORIGIN');
    res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
    res.setHeader('content-security-policy', "default-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
    next();
}
function isLoopbackClient(req) {
    const forwarded = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    const ip = forwarded || req.socket.remoteAddress || '';
    return (ip === '127.0.0.1' ||
        ip === '::1' ||
        ip === '::ffff:127.0.0.1' ||
        ip.startsWith('127.'));
}
async function hrmRateLimitMiddleware(req, res, next) {
    if (process.env.NODE_ENV !== 'production' && isLoopbackClient(req)) {
        next();
        return;
    }
    const allowed = await rateLimit(req, res);
    if (allowed)
        next();
}
function hrmMetricsOnFinish(req, res) {
    const startedAt = Date.now();
    res.on('finish', () => {
        const route = req.route?.path ?? req.path ?? req.url ?? 'unknown';
        const codeHeader = res.getHeader('x-api-code');
        (0, platform_core_1.recordHttpMetrics)(exports.HRM_SERVICE_NAME, {
            method: req.method ?? 'GET',
            route,
            status: res.statusCode,
            code: typeof codeHeader === 'string' ? codeHeader : undefined,
            durationMs: Date.now() - startedAt,
        });
    });
}
//# sourceMappingURL=platform-runtime.js.map