"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signServiceJwt = signServiceJwt;
const node_crypto_1 = require("node:crypto");
function base64UrlEncode(input) {
    return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function signServiceJwt(claims, ttlSec = 12 * 60 * 60) {
    const secret = process.env.SERVICE_JWT_SECRET ??
        process.env.JWT_SECRET ??
        process.env.ACCESS_TOKEN_SECRET ??
        process.env.XBOS_JWT_SECRET ??
        (process.env.NODE_ENV !== 'production' ? 'xevn-dev-jwt-secret' : undefined);
    if (!secret) {
        throw new Error('One of SERVICE_JWT_SECRET/JWT_SECRET/ACCESS_TOKEN_SECRET/XBOS_JWT_SECRET is required');
    }
    const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        ...claims,
        iss: process.env.SERVICE_JWT_ISSUER ?? 'xevn-internal',
        aud: process.env.SERVICE_JWT_AUDIENCE ?? 'xevn-api',
        iat: now,
        exp: now + ttlSec,
    };
    const payloadPart = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
    const signingInput = `${header}.${payloadPart}`;
    const signature = base64UrlEncode((0, node_crypto_1.createHmac)('sha256', secret).update(signingInput).digest());
    return `${signingInput}.${signature}`;
}
//# sourceMappingURL=jwt-sign.js.map