"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyMiddleware = idempotencyMiddleware;
const seenKeys = new Map();
const TTL_MS = 24 * 60 * 60 * 1000;
function idempotencyMiddleware(req, res, next) {
    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
        next();
        return;
    }
    const key = req.headers['idempotency-key']?.trim();
    if (!key) {
        next();
        return;
    }
    const now = Date.now();
    const existing = seenKeys.get(key);
    if (existing && now - existing < TTL_MS) {
        res.status(409).json({
            success: false,
            code: 'HRM-IDEMPOTENCY-409',
            message: 'Duplicate Idempotency-Key',
            timestamp: new Date().toISOString(),
        });
        return;
    }
    seenKeys.set(key, now);
    next();
}
//# sourceMappingURL=idempotency.middleware.js.map