/**
 * @CODE-MEMORY
 * Screen:     Thư viện JD + Cài đặt JD động (pure helpers)
 * UC:         UC-BP-REC-00g · UC-BP-REC-00h · AC-JD-GRP-04/05
 * BR:         BR-BP-JD-DYN-02 · VAL-GRP-14 · Q6 snapshot
 * SRS:        docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md § UC-00g/00h
 * TechSpec:   docs/program/specs/PO-HRM-JD-GROUP-ARCH-01.md §1 · §3.7 · WORLD §3.6
 * Purpose:    Build/merge layout_snapshot v2 (pack + groups + fields); view order from snapshot only.
 * WorkItem:   PO-HRM-JD-DYNAMIC-FE-01
 * Coded:      2026-08-06
 * Callers:    JdTemplateWriterDialog · JdTemplateViewPanel · tests
 * Callees:    none (pure)
 * must_keep:  No hardcode PACK_* selection; title-first; G4 merge giữ values trùng key
 * SOLID:      Pure functions — UI/API stay outside
 * LastVerified: docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md
 */

export type JdFieldType = 'short_text' | 'long_text' | 'select' | 'number' | 'date';

export type JdViewStyle =
  | 'heading'
  | 'heading_block'
  | 'bullets'
  | 'chips'
  | 'key_value'
  | 'plain';

export type JdSnapshotField = {
  field_key: string;
  label: string;
  field_type: JdFieldType | string;
  is_required?: boolean;
  sort_order: number;
  field_id?: string;
};

export type JdSnapshotGroup = {
  group_code: string;
  label: string;
  view_style: JdViewStyle | string;
  source: 'pack_always_on' | 'optional_dnd' | 'detached' | 'legacy_flat' | string;
  sort_order: number;
  fields: JdSnapshotField[];
};

export type JdLayoutSnapshotV2 = {
  layout_version: number;
  pack_code: string | null;
  pack_label?: string | null;
  resolved_from_rule_id?: string | null;
  groups: JdSnapshotGroup[];
};

export type JdValuesMap = Record<string, string>;

const TITLE_KEY = 'title';

/** Ensure title field is first overall (hero) when present in any group. */
export function ensureTitleFirst(groups: JdSnapshotGroup[]): JdSnapshotGroup[] {
  const cloned = groups.map((g) => ({
    ...g,
    fields: [...g.fields].sort((a, b) => a.sort_order - b.sort_order),
  }));
  const titleGroupIdx = cloned.findIndex((g) =>
    g.fields.some((f) => f.field_key === TITLE_KEY),
  );
  if (titleGroupIdx < 0) return renumberGroups(cloned);

  const [titleGroup] = cloned.splice(titleGroupIdx, 1);
  const titleField = titleGroup.fields.find((f) => f.field_key === TITLE_KEY);
  const otherFields = titleGroup.fields.filter((f) => f.field_key !== TITLE_KEY);
  const heroGroup: JdSnapshotGroup = {
    ...titleGroup,
    sort_order: 0,
    fields: titleField
      ? [{ ...titleField, sort_order: 0 }, ...otherFields.map((f, i) => ({ ...f, sort_order: i + 1 }))]
      : otherFields,
  };
  return renumberGroups([heroGroup, ...cloned]);
}

function renumberGroups(groups: JdSnapshotGroup[]): JdSnapshotGroup[] {
  return groups.map((g, i) => ({ ...g, sort_order: i }));
}

/** View/render order = snapshot groups by sort_order (WORLD §3.6 via CFG/snapshot — not FE hardcode). */
export function orderGroupsForView(groups: readonly JdSnapshotGroup[]): JdSnapshotGroup[] {
  return [...groups].sort((a, b) => a.sort_order - b.sort_order).map((g) => ({
    ...g,
    fields: [...g.fields].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export function buildSnapshotV2(input: {
  pack_code: string | null;
  pack_label?: string | null;
  resolved_from_rule_id?: string | null;
  groups: JdSnapshotGroup[];
}): JdLayoutSnapshotV2 {
  return {
    layout_version: 2,
    pack_code: input.pack_code,
    pack_label: input.pack_label ?? null,
    resolved_from_rule_id: input.resolved_from_rule_id ?? null,
    groups: ensureTitleFirst(input.groups),
  };
}

/**
 * G4 — apply new pack without wiping values:
 * - add missing always_on groups
 * - keep values for overlapping field keys
 * - detach groups no longer in pack (source=detached), keep content
 */
export function mergePackOntoCanvas(args: {
  previousGroups: JdSnapshotGroup[];
  previousValues: JdValuesMap;
  nextAlwaysOnGroups: JdSnapshotGroup[];
  pack_code: string;
  pack_label?: string | null;
  resolved_from_rule_id?: string | null;
}): { snapshot: JdLayoutSnapshotV2; values: JdValuesMap } {
  const prevByCode = new Map(args.previousGroups.map((g) => [g.group_code, g]));
  const nextCodes = new Set(args.nextAlwaysOnGroups.map((g) => g.group_code));

  const mergedAlwaysOn: JdSnapshotGroup[] = args.nextAlwaysOnGroups.map((g, idx) => {
    const prev = prevByCode.get(g.group_code);
    return {
      ...g,
      source: 'pack_always_on',
      sort_order: idx,
      fields: (prev?.fields?.length ? mergeFields(prev.fields, g.fields) : g.fields).map((f, i) => ({
        ...f,
        sort_order: i,
      })),
    };
  });

  const detached: JdSnapshotGroup[] = args.previousGroups
    .filter((g) => !nextCodes.has(g.group_code))
    .map((g, i) => ({
      ...g,
      source: g.source === 'optional_dnd' ? 'optional_dnd' : 'detached',
      sort_order: mergedAlwaysOn.length + i,
    }));

  const snapshot = buildSnapshotV2({
    pack_code: args.pack_code,
    pack_label: args.pack_label,
    resolved_from_rule_id: args.resolved_from_rule_id,
    groups: [...mergedAlwaysOn, ...detached],
  });

  const allowedKeys = new Set(
    snapshot.groups.flatMap((g) => g.fields.map((f) => f.field_key)),
  );
  const values: JdValuesMap = {};
  for (const [k, v] of Object.entries(args.previousValues)) {
    if (allowedKeys.has(k)) values[k] = v;
  }
  return { snapshot, values };
}

function mergeFields(prev: JdSnapshotField[], next: JdSnapshotField[]): JdSnapshotField[] {
  const prevKeys = new Map(prev.map((f) => [f.field_key, f]));
  const out: JdSnapshotField[] = next.map((f, i) => ({
    ...(prevKeys.get(f.field_key) ?? f),
    ...f,
    sort_order: i,
  }));
  for (const f of prev) {
    if (!out.some((x) => x.field_key === f.field_key)) {
      out.push({ ...f, sort_order: out.length });
    }
  }
  return out;
}

export function addOptionalGroup(
  groups: JdSnapshotGroup[],
  group: JdSnapshotGroup,
): JdSnapshotGroup[] {
  if (groups.some((g) => g.group_code === group.group_code)) return groups;
  return ensureTitleFirst([
    ...groups,
    { ...group, source: 'optional_dnd', sort_order: groups.length },
  ]);
}

export function reorderGroupsByCodes(
  groups: JdSnapshotGroup[],
  orderedCodes: string[],
): JdSnapshotGroup[] {
  const map = new Map(groups.map((g) => [g.group_code, g]));
  const next: JdSnapshotGroup[] = [];
  for (const code of orderedCodes) {
    const g = map.get(code);
    if (g) next.push(g);
  }
  for (const g of groups) {
    if (!orderedCodes.includes(g.group_code)) next.push(g);
  }
  return ensureTitleFirst(next);
}

/** Bridge legacy flat JD into synthetic SEC_FLAT for view. */
export function legacyFlatSnapshot(row: {
  title?: string | null;
  job_description?: string | null;
  requirements?: string | null;
}): JdLayoutSnapshotV2 {
  return buildSnapshotV2({
    pack_code: null,
    groups: [
      {
        group_code: 'SEC_FLAT',
        label: 'Nội dung JD',
        view_style: 'heading',
        source: 'legacy_flat',
        sort_order: 0,
        fields: [
          {
            field_key: 'title',
            label: 'Chức danh',
            field_type: 'short_text',
            is_required: true,
            sort_order: 0,
          },
          {
            field_key: 'responsibilities',
            label: 'Mô tả / trách nhiệm',
            field_type: 'long_text',
            sort_order: 1,
          },
          {
            field_key: 'requirements',
            label: 'Yêu cầu',
            field_type: 'long_text',
            sort_order: 2,
          },
        ],
      },
    ],
  });
}

export function bridgeLegacyValues(row: {
  title?: string | null;
  job_description?: string | null;
  requirements?: string | null;
}): JdValuesMap {
  return {
    title: row.title?.trim() ?? '',
    responsibilities: row.job_description?.trim() ?? '',
    requirements: row.requirements?.trim() ?? '',
  };
}

export function isBulletsStyle(style: string | undefined): boolean {
  return style === 'bullets';
}

export function isChipsStyle(style: string | undefined): boolean {
  return style === 'chips';
}

export function isKeyValueStyle(style: string | undefined): boolean {
  return style === 'key_value' || style === 'plain';
}
