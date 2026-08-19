/**
 * @CODE-MEMORY
 * Screen:     Thư viện JD writer + Cài đặt JD rules (client contract normalize)
 * UC:         UC-BP-REC-00g · F-JD-RUL-02/03
 * BR:         BR-BP-JD-DYN-01 · VAL-GRP layout non-empty
 * SRS:        docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md pack resolve AC
 * TechSpec:   docs/program/specs/PO-HRM-JD-GROUP-ARCH-01.md F-JD-RUL
 * Purpose:    Chuẩn hóa resolve API (always_on_groups → groups) và strip PUT rules về DTO-only.
 * WorkItem:   PO-HRM-JD-DYNAMIC-FE-03
 * Coded:      2026-08-06
 * Callers:    hrmApi.resolveJdPack · hrmApi.putJdPackRules · tests
 * Callees:    none (pure)
 * must_keep:  Không hardcode PACK_*; không gửi id/company_id/created_at/pack_label lên PUT
 * SOLID:      Pure normalize — UI/API transport ngoài
 * LastVerified: docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md
 */

import type { JdSnapshotField, JdSnapshotGroup } from '@/lib/jdDynamicSnapshot';

/** DTO fields only — mirrors PutJdPackRulesDto / JdPackRuleItemDto. */
export type JdPackRulePutItem = {
  priority: number;
  match_type: string;
  match_value?: string | null;
  pack_id?: string;
  pack_code?: string;
  condition_json?: Record<string, unknown>;
  is_active?: boolean;
};

export type NormalizedJdPackResolve = {
  pack_code: string;
  pack_label?: string | null;
  resolved_from_rule_id?: string | null;
  /** Always-on canvas groups (normalized from always_on_groups || groups || pack.groups). */
  groups: JdSnapshotGroup[];
  /** Optional pack members when API/pack exposes always_on=false rows. */
  optional_groups: JdSnapshotGroup[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeField(raw: unknown, index: number): JdSnapshotField {
  const f = asRecord(raw) ?? {};
  const fieldKey = String(f.field_key ?? f.field_id ?? `field_${index}`);
  return {
    field_id: typeof f.field_id === 'string' ? f.field_id : undefined,
    field_key: fieldKey,
    label: String(f.label ?? fieldKey),
    field_type: String(f.field_type ?? 'long_text'),
    is_required: Boolean(f.is_required),
    sort_order: Number(f.sort_order ?? index),
  };
}

function normalizeGroup(
  raw: unknown,
  index: number,
  defaultSource: 'pack_always_on' | 'optional_dnd',
): JdSnapshotGroup {
  const g = asRecord(raw) ?? {};
  const groupCode = String(g.group_code ?? g.code ?? '').trim();
  const fieldsRaw = Array.isArray(g.fields) ? g.fields : [];
  return {
    group_code: groupCode,
    label: String(g.label ?? groupCode),
    view_style: String(g.view_style ?? 'heading'),
    source: typeof g.source === 'string' && g.source ? g.source : defaultSource,
    sort_order: Number(g.sort_order ?? index),
    fields: fieldsRaw.map((f, i) => normalizeField(f, i)),
  };
}

function pickAlwaysOnRaw(raw: Record<string, unknown>): unknown[] {
  if (Array.isArray(raw.always_on_groups) && raw.always_on_groups.length > 0) {
    return raw.always_on_groups;
  }
  if (Array.isArray(raw.groups) && raw.groups.length > 0) {
    return raw.groups;
  }
  const pack = asRecord(raw.pack);
  if (pack && Array.isArray(pack.groups)) {
    return pack.groups.filter((g) => {
      const row = asRecord(g);
      return row ? row.always_on !== false : false;
    });
  }
  return [];
}

function pickOptionalRaw(raw: Record<string, unknown>, alwaysOn: unknown[]): unknown[] {
  if (Array.isArray(raw.optional_groups) && raw.optional_groups.length > 0) {
    return raw.optional_groups;
  }
  const pack = asRecord(raw.pack);
  if (!pack || !Array.isArray(pack.groups)) return [];
  const alwaysCodes = new Set(
    alwaysOn
      .map((g) => {
        const row = asRecord(g);
        return row ? String(row.group_code ?? row.code ?? '').trim().toUpperCase() : '';
      })
      .filter(Boolean),
  );
  return pack.groups.filter((g) => {
    const row = asRecord(g);
    if (!row) return false;
    if (row.always_on === true) return false;
    const code = String(row.group_code ?? row.code ?? '').trim().toUpperCase();
    return code.length > 0 && !alwaysCodes.has(code);
  });
}

/**
 * Normalize POST /jd-pack-rules/resolve body so writer can always read `groups[]`.
 * Live API returns `always_on_groups` (not top-level `groups`).
 */
export function normalizeJdPackResolveResult(raw: unknown): NormalizedJdPackResolve {
  const o = asRecord(raw) ?? {};
  const alwaysRaw = pickAlwaysOnRaw(o);
  const optionalRaw = pickOptionalRaw(o, alwaysRaw);
  return {
    pack_code: String(o.pack_code ?? ''),
    pack_label: o.pack_label == null ? null : String(o.pack_label),
    resolved_from_rule_id:
      o.resolved_from_rule_id == null || o.resolved_from_rule_id === ''
        ? null
        : String(o.resolved_from_rule_id),
    groups: alwaysRaw.map((g, i) => normalizeGroup(g, i, 'pack_always_on')),
    optional_groups: optionalRaw.map((g, i) => normalizeGroup(g, i, 'optional_dnd')),
  };
}

/** Strip GET rule objects to PutJdPackRulesDto item fields (forbid id/company_id/timestamps/labels). */
export function stripJdPackRulesForPut(rules: unknown[]): JdPackRulePutItem[] {
  if (!Array.isArray(rules)) return [];
  return rules.map((rule) => {
    const o = asRecord(rule) ?? {};
    const item: JdPackRulePutItem = {
      priority: Number(o.priority ?? 0),
      match_type: String(o.match_type ?? ''),
    };
    if ('match_value' in o) {
      item.match_value = o.match_value == null ? null : String(o.match_value);
    }
    if (typeof o.pack_id === 'string' && o.pack_id.trim()) {
      item.pack_id = o.pack_id.trim();
    }
    if (typeof o.pack_code === 'string' && o.pack_code.trim()) {
      item.pack_code = o.pack_code.trim();
    }
    if (o.condition_json && typeof o.condition_json === 'object' && !Array.isArray(o.condition_json)) {
      item.condition_json = o.condition_json as Record<string, unknown>;
    }
    if (typeof o.is_active === 'boolean') {
      item.is_active = o.is_active;
    }
    return item;
  });
}
