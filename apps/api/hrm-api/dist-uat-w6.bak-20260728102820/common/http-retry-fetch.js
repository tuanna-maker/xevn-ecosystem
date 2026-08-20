"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimeoutAndRetry = fetchWithTimeoutAndRetry;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const TRANSIENT_HTTP_STATUSES = new Set([502, 503, 504]);
function isTransientHttpStatus(status) {
    return TRANSIENT_HTTP_STATUSES.has(status);
}
function isAbortError(err) {
    if (err instanceof DOMException && err.name === 'AbortError')
        return true;
    if (err instanceof Error && err.name === 'AbortError')
        return true;
    return false;
}
function isTransientNetworkError(err) {
    if (isAbortError(err))
        return false;
    return err instanceof TypeError;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function fetchWithTimeoutAndRetry(url, init = {}) {
    const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxAttempts = init.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    const { timeoutMs: _t, maxAttempts: _m, ...requestInit } = init;
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                ...requestInit,
                signal: controller.signal,
            });
            clearTimeout(timer);
            if (isTransientHttpStatus(response.status) && attempt < maxAttempts - 1) {
                await sleep(50 * 2 ** attempt);
                try {
                    await response.body?.cancel();
                }
                catch {
                }
                continue;
            }
            return response;
        }
        catch (err) {
            clearTimeout(timer);
            lastError = err;
            if (isTransientNetworkError(err) && attempt < maxAttempts - 1) {
                await sleep(50 * 2 ** attempt);
                continue;
            }
            throw err;
        }
    }
    throw lastError instanceof Error ? lastError : new Error('fetchWithTimeoutAndRetry failed');
}
//# sourceMappingURL=http-retry-fetch.js.map