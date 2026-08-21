/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Xem JD (TopCV-style hierarchy)
 * UC:         UC-BP-REC-00h · AC-JD-GRP-07 · AC-JD-DYN-13
 * BR:         Q6 snapshot SoT · WORLD §3.6 view order
 * SRS:        docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md UC-00h
 * TechSpec:   docs/program/specs/PO-HRM-JD-WORLD-BENCHMARK-01.md §3.6 · GROUP-ARCH §2 FV
 * Purpose:    Render JD theo group order trong snapshot (meta chips → about → duties → req → working → benefits).
 * WorkItem:   PO-HRM-JD-DYNAMIC-FE-01
 * Coded:      2026-08-06
 * Callers:    JobTemplatesTab view dialog
 * Callees:    orderGroupsForView · getJobDescriptionTemplate (optional)
 * must_keep:  Snapshot sort_order only — no FE hardcode section list; XEVN tokens; creative_extra=none
 * LastVerified: docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md
 */
import {
  bridgeLegacyValues,
  isBulletsStyle,
  isChipsStyle,
  isKeyValueStyle,
  legacyFlatSnapshot,
  orderGroupsForView,
  type JdLayoutSnapshotV2,
  type JdValuesMap,
} from '@/lib/jdDynamicSnapshot';
import type { HrmJobDescriptionTemplate } from '@/integrations/hrmApi';

function splitBullets(value: string): string[] {
  return value
    .split(/\r?\n|•|;/)
    .map((s) => s.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

type Props = {
  row: HrmJobDescriptionTemplate;
  snapshot?: JdLayoutSnapshotV2 | null;
  values?: JdValuesMap | null;
  showEmptyFields?: boolean;
};

export function JdTemplateViewPanel({ row, snapshot, values, showEmptyFields = false }: Props) {
  const snap =
    snapshot ??
    row.layout_snapshot_json ??
    (row.sections && row.sections.length > 0
      ? ({
          layout_version: row.layout_version ?? 2,
          pack_code: null,
          groups: row.sections.map((s, i) => ({
            group_code: s.group_code || s.section || `SEC_${i}`,
            label: s.label || s.section || 'Mục',
            view_style: 'heading',
            source: 'pack_always_on',
            sort_order: i,
            fields: (s.fields || []).map((f, j) => ({
              field_key: f.field_key,
              label: f.label,
              field_type: f.field_type || 'long_text',
              sort_order: j,
            })),
          })),
        } satisfies JdLayoutSnapshotV2)
      : legacyFlatSnapshot(row));

  const vals: JdValuesMap =
    values ??
    row.values_json ??
    (row.sections
      ? Object.fromEntries(
          row.sections.flatMap((s) =>
            (s.fields || []).map((f) => [f.field_key, String(f.value ?? '')]),
          ),
        )
      : bridgeLegacyValues(row));

  const groups = orderGroupsForView(snap.groups || []);

  return (
    <article
      className="space-y-6 rounded-card border border-border/60 bg-surface p-6 shadow-soft"
      data-testid="jd-template-view-panel"
    >
      <header className="space-y-2 border-b border-border/50 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-xevn-textSecondary">
          {row.code}
          {snap.pack_code ? ` · ${snap.pack_label || snap.pack_code}` : ''}
        </p>
        <h2 className="font-display text-[22px] font-bold tracking-tight text-xevn-text">
          {vals.title?.trim() || row.title}
        </h2>
        {row.position_name || row.position_code ? (
          <p className="text-sm text-xevn-textSecondary">
            {row.position_name || row.position_code}
          </p>
        ) : null}
      </header>

      {groups.map((group) => {
        const fields = [...group.fields].sort((a, b) => a.sort_order - b.sort_order);
        const isMeta = isChipsStyle(group.view_style) || group.group_code === 'SEC_META';

        if (isMeta) {
          const chips = fields.filter((f) => f.field_key !== 'title' && (showEmptyFields || vals[f.field_key]?.trim()));
          if (chips.length === 0 && !vals.title) return null;
          return (
            <section key={group.group_code} data-testid={`jd-view-group-${group.group_code}`}>
              <div className="flex flex-wrap gap-2">
                {chips.map((f) => {
                  const val = vals[f.field_key]?.trim();
                  return (
                    <span
                      key={f.field_key}
                      className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-xevn-text"
                    >
                      <span className="mr-1 text-xevn-textSecondary">{f.label}:</span>
                      {val ? val : <span className="text-muted-foreground italic text-[11px] ml-1">(Trống)</span>}
                    </span>
                  );
                })}
              </div>
            </section>
          );
        }

        const bodyFields = fields.filter((f) => f.field_key !== 'title');
        const hasContent = bodyFields.some((f) => vals[f.field_key]?.trim());
        if (!hasContent && !showEmptyFields) return null;

        return (
          <section key={group.group_code} className="space-y-2" data-testid={`jd-view-group-${group.group_code}`}>
            <h3 className="font-display text-[18px] font-semibold text-xevn-text">{group.label}</h3>
            {bodyFields.map((f) => {
              const raw = vals[f.field_key]?.trim() ?? '';
              if (!raw && !showEmptyFields) return null;
              
              const emptyFallback = <span className="text-sm italic text-muted-foreground">(Chưa có nội dung)</span>;

              if (isBulletsStyle(group.view_style)) {
                const items = raw ? splitBullets(raw) : [];
                return (
                  <div key={f.field_key}>
                    {f.label && bodyFields.length > 1 ? (
                      <p className="mb-1 text-sm font-medium text-xevn-textSecondary">{f.label}</p>
                    ) : null}
                    {!raw ? emptyFallback : (
                      <ul className="list-disc space-y-1 pl-5 text-sm text-xevn-text">
                        {items.map((item, idx) => (
                          <li key={`${f.field_key}-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              }
              if (isKeyValueStyle(group.view_style)) {
                return (
                  <div key={f.field_key} className="grid grid-cols-12 gap-2 text-sm">
                    <dt className="col-span-4 font-medium text-xevn-textSecondary">{f.label}</dt>
                    <dd className="col-span-8 whitespace-pre-wrap text-xevn-text">{raw || emptyFallback}</dd>
                  </div>
                );
              }
              return (
                <div key={f.field_key} className="space-y-1">
                  {bodyFields.length > 1 ? (
                    <p className="text-sm font-medium text-xevn-textSecondary">{f.label}</p>
                  ) : null}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-xevn-text">
                    {raw || emptyFallback}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </article>
  );
}
