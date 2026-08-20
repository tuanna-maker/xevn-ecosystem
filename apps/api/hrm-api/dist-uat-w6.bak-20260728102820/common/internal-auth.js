"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerifiedInternalJwtPayload = getVerifiedInternalJwtPayload;
exports.extractBearerToken = extractBearerToken;
exports.resolveAuthorizationHeader = resolveAuthorizationHeader;
exports.normalizeAuthorizationHeaderInPlace = normalizeAuthorizationHeaderInPlace;
exports.isAuthorizedInternalRequest = isAuthorizedInternalRequest;
const node_crypto_1 = require("node:crypto");
const BEARER_PREFIX_RE = /^bearer\s+/i;
function readConfiguredJwtSecrets() {
    const candidates = [
        process.env.SERVICE_JWT_SECRET,
        process.env.JWT_SECRET,
        process.env.ACCESS_TOKEN_SECRET,
        process.env.XBOS_JWT_SECRET,
    ];
    const normalized = candidates
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0);
    if (normalized.length > 0) {
        return [...new Set(normalized)];
    }
    if (process.env.NODE_ENV !== 'production') {
        return ['xevn-dev-jwt-secret'];
    }
    return [];
}
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
    const bearerToken = extractBearerToken(authorizationHeader);
    const secrets = readConfiguredJwtSecrets();
    const issuer = process.env.SERVICE_JWT_ISSUER ?? 'xevn-internal';
    const audience = process.env.SERVICE_JWT_AUDIENCE ?? 'xevn-api';
    if (!bearerToken || secrets.length === 0) {
        return null;
    }
    const signatureMatches = secrets.some((secret) => verifyHs256Signature(bearerToken, secret));
    if (!signatureMatches) {
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
function readHeaderValue(headers, key) {
    const value = headers[key];
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }
    if (Array.isArray(value)) {
        const firstString = value.find((item) => typeof item === 'string' && item.trim());
        if (typeof firstString === 'string') {
            return firstString.trim();
        }
    }
    return undefined;
}
function parseCookie(cookieHeader, cookieName) {
    const pairs = cookieHeader.split(';');
    for (const pair of pairs) {
        const [rawName, ...rest] = pair.split('=');
        if (!rawName || rest.length === 0)
            continue;
        if (rawName.trim() !== cookieName)
            continue;
        const rawValue = rest.join('=').trim();
        if (!rawValue)
            return undefined;
        try {
            const decoded = decodeURIComponent(rawValue);
            const unquoted = decoded.replace(/^"(.*)"$/, '$1').trim();
            return unquoted || undefined;
        }
        catch {
            const unquoted = rawValue.replace(/^"(.*)"$/, '$1').trim();
            return unquoted || undefined;
        }
    }
    return undefined;
}
function extractBearerToken(rawAuthorization) {
    if (!rawAuthorization)
        return undefined;
    const trimmed = rawAuthorization.trim();
    if (!trimmed)
        return undefined;
    if (BEARER_PREFIX_RE.test(trimmed)) {
        const token = trimmed.replace(BEARER_PREFIX_RE, '').trim();
        return token || undefined;
    }
    return undefined;
}
function resolveAuthorizationHeader(authorizationHeader, headers) {
    const directToken = extractBearerToken(authorizationHeader);
    if (directToken) {
        return `Bearer ${directToken}`;
    }
    if (!headers)
        return authorizationHeader;
    const headerTokenCandidates = [
        readHeaderValue(headers, 'x-access-token'),
        readHeaderValue(headers, 'x-portal-access-token'),
        readHeaderValue(headers, 'x-auth-token'),
    ];
    for (const candidate of headerTokenCandidates) {
        if (candidate) {
            const normalized = extractBearerToken(candidate) ?? candidate.trim();
            if (normalized)
                return `Bearer ${normalized}`;
        }
    }
    const cookieHeader = readHeaderValue(headers, 'cookie');
    if (cookieHeader) {
        const cookieToken = (parseCookie(cookieHeader, 'xevn.portal.accessToken') ??
            parseCookie(cookieHeader, 'xevn.portal.access_token') ??
            parseCookie(cookieHeader, 'xevn_portal_access_token'))?.trim();
        if (cookieToken) {
            return `Bearer ${cookieToken}`;
        }
    }
    return authorizationHeader;
}
function normalizeAuthorizationHeaderInPlace(headers) {
    const currentAuthorization = readHeaderValue(headers, 'authorization');
    const resolvedAuthorization = resolveAuthorizationHeader(currentAuthorization, headers);
    if (resolvedAuthorization) {
        headers.authorization = resolvedAuthorization;
    }
}
function isAuthorizedInternalRequest(authorizationHeader, internalApiKey) {
    if (getVerifiedInternalJwtPayload(authorizationHeader))
        return true;
    const configuredKey = process.env.INTERNAL_API_KEY;
    const fallbackKey = 'xevn-dev-internal-key';
    const canUseStaticKey = process.env.NODE_ENV !== 'production';
    return Boolean(canUseStaticKey && internalApiKey && (internalApiKey === configuredKey || internalApiKey === fallbackKey));
}
//# sourceMappingURL=internal-auth.js.map