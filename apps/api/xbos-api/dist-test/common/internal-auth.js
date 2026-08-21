"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerifiedInternalJwtPayload = getVerifiedInternalJwtPayload;
exports.isAuthorizedInternalRequest = isAuthorizedInternalRequest;
const node_crypto_1 = require("node:crypto");
function base64UrlDecode(input) {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
    return Buffer.from(padded, 'base64').toString('utf8');
}
function base64UrlEncode(input) {
    return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function verifyHs256Signature(token, secret) {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature)
        return false;
    const signingInput = `${header}.${payload}`;
    const digest = (0, node_crypto_1.createHmac)('sha256', secret).update(signingInput).digest();
    const expectedSignature = base64UrlEncode(digest);
    const expectedBuf = Buffer.from(expectedSignature);
    const receivedBuf = Buffer.from(signature);
    if (expectedBuf.length !== receivedBuf.length)
        return false;
    return (0, node_crypto_1.timingSafeEqual)(expectedBuf, receivedBuf);
}
function parseJwtPayload(token) {
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    const payloadRaw = base64UrlDecode(parts[1]);
    try {
        return JSON.parse(payloadRaw);
    }
    catch {
        return null;
    }
}
function getVerifiedInternalJwtPayload(authorizationHeader) {
    const bearerToken = authorizationHeader?.startsWith('Bearer ')
        ? authorizationHeader.slice('Bearer '.length).trim()
        : undefined;
    const secret = process.env.SERVICE_JWT_SECRET ??
        (process.env.NODE_ENV !== 'production' ? 'xevn-dev-jwt-secret' : undefined);
    const issuer = process.env.SERVICE_JWT_ISSUER ?? 'xevn-internal';
    const audience = process.env.SERVICE_JWT_AUDIENCE ?? 'xevn-api';
    if (!bearerToken || !secret || !verifyHs256Signature(bearerToken, secret)) {
        return null;
    }
    const payload = parseJwtPayload(bearerToken);
    if (!payload)
        return null;
    const nowSec = Math.floor(Date.now() / 1000);
    const payloadAud = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
    const audienceOk = payloadAud.length === 0 || payloadAud.includes(audience);
    const issuerOk = !payload.iss || payload.iss === issuer;
    const expOk = !payload.exp || payload.exp > nowSec;
    const nbfOk = !payload.nbf || payload.nbf <= nowSec;
    if (!audienceOk || !issuerOk || !expOk || !nbfOk)
        return null;
    return payload;
}
function isAuthorizedInternalRequest(authorizationHeader, internalApiKey) {
    if (getVerifiedInternalJwtPayload(authorizationHeader))
        return true;
    // Dev-only fallback for local simulation.
    const configuredKey = process.env.INTERNAL_API_KEY;
    const fallbackKey = 'xevn-dev-internal-key';
    const canUseStaticKey = process.env.NODE_ENV !== 'production';
    return Boolean(canUseStaticKey && internalApiKey && (internalApiKey === configuredKey || internalApiKey === fallbackKey));
}
