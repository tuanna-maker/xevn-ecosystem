/**
 * @CODE-MEMORY
 * Screen:     Shared IMergeToken resolver (Nest helper — no I/O)
 * UC:         BR-PLT-01 · AC-PLT-CTR-05 · VAL-PLT-TOK-01..05
 * BR:         DATA §5.2 resolve order · BR-CD-F5-01 (cb mask)
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md §3.5
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md §5.2
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md §2 · F-PLT-TOK-03
 * Purpose:    Deterministic merge resolve: issued → registry wins → keyword_map → builtin → missing.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01
 * Coded:      2026-08-07
 * Callers:    MergeTokensService.resolvePreview · ContractLegalPrintService.previewContract
 * Callees:    merge-token.constants (aliases / builtins)
 * Impact:     Sai thứ tự → keyword_map đè registry / empty registry phá print-spine
 * must_keep:  empty registry → keyword_map fallback · {{ }} only · soft warn default
 * SOLID:      Pure resolver — injectable services load rows, this binds
 * LastVerified: merge-token.resolver.spec.ts
 */

import {
  MERGE_TOKEN_BUILTIN_DEFAULTS,
  MERGE_TOKEN_HASH_SYNTAX,
  MERGE_TOKEN_SOURCE_TO_BAG,
  type MergeTokenResolveSource,
  type MergeTokenRing,
} from './merge-token.constants';

export type MergeTokenRegistryRow = {
  tokenKey: string;
  sourcePath: string;
  ring: string;
  domain?: string;
  labelVi?: string;
  status?: string;
};

export type MergeTokenResolvedItem = {
  tokenKey: string;
  displayToken: string;
  source: MergeTokenResolveSource;
  sourcePath?: string;
  ring?: string;
  value?: unknown;
  masked?: boolean;
  warning?: string;
};

export type ResolveMergeTokensInput = {
  /** Active registry rows for company (archived excluded). Empty = keyword_map-only path. */
  registry: MergeTokenRegistryRow[];
  /** Template keyword_map jsonb — keys may be {{token}} or bare. */
  keywordMap?: Record<string, unknown> | null;
  /** Live print bag (contract/employee/OU columns). */
  valueBag?: Record<string, unknown> | null;
  /** Optional filter; default = union(registry, keyword_map, builtins referenced). */
  tokenKeys?: string[];
  fieldOverrides?: Record<string, unknown> | null;
  canViewCb?: boolean;
  /** When true + missing mandatory → caller may throw HRM-PLT-TOKEN-UNKNOWN. */
  strict?: boolean;
  /** Issued print version snapshot — short-circuit (BR-PLT-03). */
  issuedMergedFields?: Record<string, unknown> | null;
};

export type ResolveMergeTokensResult = {
  resolveOrder: string;
  tokens: MergeTokenResolvedItem[];
  mergedPreview: Record<string, unknown>;
  warnings: string[];
};

/** Strip `{{…}}` braces; leave bare key. */
export function normalizeTokenKey(raw: string): string {
  const t = String(raw ?? '').trim();
  const m = t.match(/^\{\{\s*([a-z][a-z0-9_.]*)\s*\}\}$/i);
  if (m) return m[1].toLowerCase();
  return t.toLowerCase();
}

export function assertNoHashTokenSyntax(sample: string): void {
  if (MERGE_TOKEN_HASH_SYNTAX.test(sample)) {
    throw Object.assign(new Error('HRM-PLT-SCHEMA-INVALID'), {
      code: 'HRM-PLT-SCHEMA-INVALID',
      message: 'Dual #token# syntax forbidden in GĐ1 — use {{token_key}} only',
    });
  }
}

export function parseKeywordMapBindings(
  keywordMap: Record<string, unknown> | null | undefined,
): Map<string, { sourcePath: string; ring: string }> {
  const out = new Map<string, { sourcePath: string; ring: string }>();
  if (!keywordMap) return out;
  for (const [rawKey, rawVal] of Object.entries(keywordMap)) {
    assertNoHashTokenSyntax(rawKey);
    if (typeof rawVal === 'string') {
      assertNoHashTokenSyntax(rawVal);
    } else if (rawVal && typeof rawVal === 'object') {
      const o = rawVal as Record<string, unknown>;
      if (typeof o.source === 'string') assertNoHashTokenSyntax(o.source);
    }
    const key = normalizeTokenKey(rawKey);
    if (!key) continue;
    if (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal)) {
      const o = rawVal as Record<string, unknown>;
      const sourcePath = String(o.source ?? o.source_path ?? key).trim();
      const ring = String(o.ring ?? 'public').trim() || 'public';
      out.set(key, { sourcePath, ring });
    } else if (typeof rawVal === 'string') {
      out.set(key, { sourcePath: rawVal.trim() || key, ring: 'public' });
    }
  }
  return out;
}

function registryMap(
  rows: MergeTokenRegistryRow[],
): Map<string, MergeTokenRegistryRow> {
  const m = new Map<string, MergeTokenRegistryRow>();
  for (const r of rows) {
    const k = normalizeTokenKey(r.tokenKey);
    if (!k) continue;
    if ((r.status ?? 'active') !== 'active') continue;
    m.set(k, { ...r, tokenKey: k });
  }
  return m;
}

function builtinMap(): Map<
  string,
  { sourcePath: string; ring: MergeTokenRing; bagKey: string }
> {
  const m = new Map<
    string,
    { sourcePath: string; ring: MergeTokenRing; bagKey: string }
  >();
  for (const b of MERGE_TOKEN_BUILTIN_DEFAULTS) {
    m.set(b.tokenKey, {
      sourcePath: b.sourcePath,
      ring: b.ring,
      bagKey: b.bagKey,
    });
  }
  return m;
}

export function resolveBagKey(sourcePath: string, tokenKey: string): string {
  const sp = sourcePath.trim();
  if (MERGE_TOKEN_SOURCE_TO_BAG[sp]) return MERGE_TOKEN_SOURCE_TO_BAG[sp];
  if (MERGE_TOKEN_SOURCE_TO_BAG[tokenKey])
    return MERGE_TOKEN_SOURCE_TO_BAG[tokenKey];
  const last = sp.includes('.') ? sp.slice(sp.lastIndexOf('.') + 1) : sp;
  if (MERGE_TOKEN_SOURCE_TO_BAG[last]) return MERGE_TOKEN_SOURCE_TO_BAG[last];
  // dotted token → underscore bag (employee.full_name → employee_full_name)
  if (tokenKey.includes('.')) return tokenKey.replace(/\./g, '_');
  return tokenKey || last;
}

function readBagValue(
  bag: Record<string, unknown>,
  sourcePath: string,
  tokenKey: string,
): unknown {
  const bagKey = resolveBagKey(sourcePath, tokenKey);
  if (Object.prototype.hasOwnProperty.call(bag, bagKey)) return bag[bagKey];
  if (Object.prototype.hasOwnProperty.call(bag, tokenKey)) return bag[tokenKey];
  if (Object.prototype.hasOwnProperty.call(bag, sourcePath))
    return bag[sourcePath];
  const last = sourcePath.includes('.')
    ? sourcePath.slice(sourcePath.lastIndexOf('.') + 1)
    : sourcePath;
  if (Object.prototype.hasOwnProperty.call(bag, last)) return bag[last];
  return undefined;
}

/**
 * DATA §5.2 / API §2 shared resolve — PREV/VER/TOK-03 MUST call this.
 */
export function resolveMergeTokens(
  input: ResolveMergeTokensInput,
): ResolveMergeTokensResult {
  const warnings: string[] = [];
  const canViewCb = input.canViewCb !== false;
  const bag: Record<string, unknown> = { ...(input.valueBag ?? {}) };
  const overrides = input.fieldOverrides ?? {};

  // 1) Issued snapshot — immutable stop
  if (
    input.issuedMergedFields &&
    Object.keys(input.issuedMergedFields).length > 0
  ) {
    const tokens: MergeTokenResolvedItem[] = [];
    const keys =
      input.tokenKeys?.map(normalizeTokenKey).filter(Boolean) ??
      Object.keys(input.issuedMergedFields).map(normalizeTokenKey);
    for (const key of keys) {
      if (!key || key.startsWith('_')) continue;
      tokens.push({
        tokenKey: key,
        displayToken: `{{${key}}}`,
        source: 'issued',
        value: input.issuedMergedFields[key],
      });
    }
    return {
      resolveOrder: 'issued',
      tokens,
      mergedPreview: { ...input.issuedMergedFields },
      warnings,
    };
  }

  const reg = registryMap(input.registry ?? []);
  const kw = parseKeywordMapBindings(input.keywordMap ?? null);
  const builtins = builtinMap();

  const keySet = new Set<string>();
  if (input.tokenKeys?.length) {
    for (const k of input.tokenKeys) {
      const n = normalizeTokenKey(k);
      if (n) keySet.add(n);
    }
  } else {
    for (const k of reg.keys()) keySet.add(k);
    for (const k of kw.keys()) keySet.add(k);
    for (const k of builtins.keys()) keySet.add(k);
    // Also include common print bag keys present in valueBag
    for (const k of Object.keys(bag)) {
      if (!k.startsWith('_') && typeof bag[k] !== 'object') {
        keySet.add(normalizeTokenKey(k));
      }
    }
  }

  const tokens: MergeTokenResolvedItem[] = [];
  const mergedPreview: Record<string, unknown> = {};
  let sawRegistry = false;
  let sawKeyword = false;
  let sawBuiltin = false;
  let sawMissing = false;

  for (const tokenKey of [...keySet].sort()) {
    if (!tokenKey) continue;
    assertNoHashTokenSyntax(tokenKey);

    // Override wins as value source but still record binding layer
    if (Object.prototype.hasOwnProperty.call(overrides, tokenKey)) {
      const v = overrides[tokenKey];
      tokens.push({
        tokenKey,
        displayToken: `{{${tokenKey}}}`,
        source: 'override',
        value: v,
      });
      mergedPreview[tokenKey] = v;
      const bagKey = resolveBagKey(tokenKey, tokenKey);
      mergedPreview[bagKey] = v;
      continue;
    }

    let source: MergeTokenResolveSource = 'missing';
    let sourcePath: string | undefined;
    let ring: string | undefined;

    const regRow = reg.get(tokenKey);
    if (regRow) {
      // VAL-PLT-TOK-01 registry wins
      source = 'registry';
      sourcePath = regRow.sourcePath;
      ring = regRow.ring;
      sawRegistry = true;
    } else if (kw.has(tokenKey)) {
      // VAL-PLT-TOK-02 / 03
      const b = kw.get(tokenKey)!;
      source = 'keyword_map';
      sourcePath = b.sourcePath;
      ring = b.ring;
      sawKeyword = true;
    } else if (builtins.has(tokenKey)) {
      const b = builtins.get(tokenKey)!;
      source = 'builtin';
      sourcePath = b.sourcePath;
      ring = b.ring;
      sawBuiltin = true;
    } else {
      // Try bare keyword_map / bag presence as soft builtin of itself
      if (Object.prototype.hasOwnProperty.call(bag, tokenKey)) {
        source = 'builtin';
        sourcePath = tokenKey;
        ring = 'public';
        sawBuiltin = true;
      } else {
        source = 'missing';
        sawMissing = true;
      }
    }

    let value: unknown =
      sourcePath !== undefined
        ? readBagValue(bag, sourcePath, tokenKey)
        : undefined;
    if (
      value === undefined &&
      Object.prototype.hasOwnProperty.call(bag, tokenKey)
    ) {
      value = bag[tokenKey];
    }

    let masked = false;
    if (ring === 'cb' && !canViewCb) {
      value = '***';
      masked = true;
    }

    const item: MergeTokenResolvedItem = {
      tokenKey,
      displayToken: `{{${tokenKey}}}`,
      source,
      sourcePath,
      ring,
      value,
      masked: masked || undefined,
    };
    if (source === 'missing') {
      item.warning = `HRM-PLT-TOKEN-UNKNOWN:${tokenKey}`;
      warnings.push(item.warning);
    }
    tokens.push(item);

    if (source !== 'missing' || value !== undefined) {
      mergedPreview[tokenKey] = value;
      const bagKey = resolveBagKey(sourcePath ?? tokenKey, tokenKey);
      if (bagKey !== tokenKey) mergedPreview[bagKey] = value;
    }
  }

  const orderParts: string[] = [];
  if (sawRegistry) orderParts.push('registry');
  if (sawKeyword) orderParts.push('keyword_map');
  if (sawBuiltin) orderParts.push('builtin');
  if (sawMissing) orderParts.push('missing');
  if (!orderParts.length) orderParts.push('keyword_map');

  if (input.strict && warnings.length) {
    // Caller may throw; we still return for soft preview path
  }

  return {
    resolveOrder: orderParts.join('|'),
    tokens,
    mergedPreview,
    warnings,
  };
}
