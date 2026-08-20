"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legalEntityBodyMiddleware = legalEntityBodyMiddleware;
const legal_entity_body_util_1 = require("../legal-entity-body.util");
function coerceJsonBody(req) {
    if (Buffer.isBuffer(req.body)) {
        try {
            req.body = JSON.parse(req.body.toString('utf8'));
        }
        catch {
            /* leave as-is */
        }
        return;
    }
    if (typeof req.body === 'string' && req.body.trim()) {
        try {
            req.body = JSON.parse(req.body);
        }
        catch {
            /* leave as-is — ValidationPipe will fail with a clear message */
        }
    }
}
function isLegalEntityMutation(req) {
    const method = req.method?.toUpperCase();
    if (method !== 'PUT' && method !== 'POST') {
        return false;
    }
    const url = req.originalUrl ?? req.url ?? '';
    return url.includes('legal-entities');
}
/** Runs after express.json() — before Nest ValidationPipe (UC-CC member save). */
function legalEntityBodyMiddleware(req, _res, next) {
    if (!isLegalEntityMutation(req)) {
        next();
        return;
    }
    coerceJsonBody(req);
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
        req.body = (0, legal_entity_body_util_1.enrichLegalEntityRequestBody)(req.body);
    }
    next();
}
