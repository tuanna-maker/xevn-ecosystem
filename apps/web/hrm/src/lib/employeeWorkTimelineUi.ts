/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Quá trình công tác
 * UC:         FR-UC-BP-CORE-01a · AC-DEC-WH-02/04 · AC-WH-PICK-01..03
 * BR:         Display-ready decision_id/decision_code/source_module; picker keys SoT
 * SRS:        docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.2/D.3
 * TechSpec:   docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md F-CORE-WH-01/02
 * Purpose:    Map WH list rows display-ready; surface QSĐ neo after effective (F5).
 * WorkItem:   PO-HRM-E2E-LINK-EMP-FE-01
 * Coded:      2026-08-06
 * Callers:    EmployeeWorkTimeline.tsx · employeeWorkTimelineUi.test.ts
 * Callees:    none
 * FEActions:  List WH → badge QSĐ khi decision_id; manual create vẫn picker keys
 * BEChain:    GET/POST/PATCH …/work-timeline
 * Impact:     Ẩn decision neo → AC-DEC-WH-02 FAIL sau F5
 * must_keep:  CatalogSearchPicker position_key; no C&B on WH; U65
 * SOLID:      Pure mapper
 * LastVerified: apps/web/hrm/src/lib/employeeWorkTimelineUi.test.ts
 */

export type WorkTimelineDisplayItem = {
  id: string;
  event_date: string;
  title: string;
  description: string | null;
  event_type: string;
  status: string;
  contract_code: string | null;
  department: string | null;
  department_key: string | null;
  position: string | null;
  position_key: string | null;
  notes: string | null;
  decision_id: string | null;
  decision_code: string | null;
  source_module: string | null;
};

export function mapWorkTimelineRow(raw: unknown): WorkTimelineDisplayItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? '').trim();
  if (!id) return null;
  return {
    id,
    event_date: String(r.event_date ?? r.effective_from ?? '').trim(),
    title: String(r.title ?? '').trim() || '—',
    description: r.description == null ? null : String(r.description),
    event_type: String(r.event_type ?? 'position'),
    status: String(r.status ?? 'current'),
    contract_code: r.contract_code == null ? null : String(r.contract_code),
    department: r.department == null ? null : String(r.department),
    department_key: r.department_key == null ? null : String(r.department_key),
    position: r.position == null ? null : String(r.position),
    position_key: r.position_key == null ? null : String(r.position_key),
    notes: r.notes == null ? null : String(r.notes),
    decision_id: r.decision_id == null ? null : String(r.decision_id).trim() || null,
    decision_code: r.decision_code == null ? null : String(r.decision_code).trim() || null,
    source_module: r.source_module == null ? null : String(r.source_module).trim() || null,
  };
}

export function mapWorkTimelineList(raw: unknown): WorkTimelineDisplayItem[] {
  const rows = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)
      ? ((raw as { data: unknown[] }).data)
      : [];
  return rows.map(mapWorkTimelineRow).filter((x): x is WorkTimelineDisplayItem => x != null);
}

export function workTimelineDecisionLabel(item: WorkTimelineDisplayItem): string | null {
  if (!item.decision_id && !item.decision_code) return null;
  if (item.decision_code) return `QSĐ ${item.decision_code}`;
  return `QSĐ #${item.decision_id!.slice(0, 8)}`;
}

export function isDecisionSourcedWorkTimeline(item: WorkTimelineDisplayItem): boolean {
  return (
    item.source_module === 'decision' ||
    Boolean(item.decision_id?.trim()) ||
    Boolean(item.decision_code?.trim())
  );
}
