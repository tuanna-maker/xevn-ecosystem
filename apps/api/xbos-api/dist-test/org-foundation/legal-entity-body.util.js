"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichLegalEntityRequestBody = enrichLegalEntityRequestBody;
/** Shared enrich logic — middleware + pipes (Command Center PUT/POST). */
function enrichLegalEntityRequestBody(value) {
    if (!value || typeof value !== 'object') {
        return value;
    }
    const raw = { ...value };
    const payload = raw.payload;
    const cf = payload && typeof payload === 'object'
        ? payload.companyForm
        : undefined;
    const nested = cf && typeof cf === 'object' ? cf : undefined;
    if (!nested) {
        return raw;
    }
    if (!String(raw.code ?? '').trim()) {
        raw.code = String(nested.shortName ?? nested.enterpriseCode ?? 'LE').trim();
    }
    if (!String(raw.name ?? '').trim()) {
        raw.name = String(nested.nameVi ?? '').trim();
    }
    return raw;
}
