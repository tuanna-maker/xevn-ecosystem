/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Mẫu bảng lương (AMIS GĐ1)
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-TPL-01..06
 * BR:         pack≠mẫu · OV-C definition_id preferred · soft-delete · R-PAY-DD-01 Form GĐ1 — cấm DnD
 * SRS:        docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md §5
 * TechSpec:   docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md OV-C · Option B
 * API_DESIGN: F-PAY-SHEET-TPL-LIST/UPSERT/LINES/ARCHIVE
 * Purpose:    Helper nhãn vi-VN + validate mã open-catalog — không FE net / không formula engine.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-TPL-FE-01
 * Coded:      2026-08-07
 * Callers:    PaySheetTemplateSettingsPanel · paySheetTemplateCatalog.test
 * Callees:    (pure) — không gọi API / không tính lương
 * FEActions:  nhập code → isValidPaySheetTemplateCodeFormat; nhãn status/scope
 * must_keep:  payroll_e2e_ready=false · cấm merge salary-templates pack · cấm DnD formula
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE–BE — chỉ format + nhãn + pass-through DTO; net/gross chỉ từ BE process
 * LastVerified: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01
 * change_mode: ADD
 * What: resolvePaySheetTemplateDisplayFromPeriod — đọc snapshot template_name trên kỳ
 * Why: AC-PAY-TPL-03 hiển thị tên mẫu trên row kỳ · F5
 * must_keep: payroll_e2e_ready=false · không invent net
 */

/** Format-only — khớp BE PAY_SHEET_TPL_CODE_FORMAT; KHÔNG phải danh sách đóng code. */
export const PAY_SHEET_TPL_CODE_FORMAT = /^[a-z][a-z0-9_-]{0,63}$/;

export const PAY_SHEET_TPL_STATUSES = ['draft', 'active', 'retired'] as const;
export type PaySheetTemplateStatus = (typeof PAY_SHEET_TPL_STATUSES)[number];

export const PAY_SHEET_TPL_APPLICABILITY = ['company', 'ou', 'position', 'employee'] as const;
export type PaySheetApplicabilityScope = (typeof PAY_SHEET_TPL_APPLICABILITY)[number];

export const PAY_SHEET_TPL_STATUS_LABELS: Record<PaySheetTemplateStatus, string> = {
  draft: 'Bản nháp',
  active: 'Đang hiệu lực',
  retired: 'Đã ngừng',
};

export const PAY_SHEET_TPL_APPLICABILITY_LABELS: Record<PaySheetApplicabilityScope, string> = {
  company: 'Toàn công ty',
  ou: 'Đơn vị / OU',
  position: 'Chức danh',
  employee: 'Nhân viên cụ thể',
};

/** Honesty lock — FE không được flip / claim LIVE e2e. */
export const PAYROLL_E2E_READY_HONESTY = false as const;

/** Pack enroll UI ≠ AMIS mẫu SoT (must_keep). */
export const PAY_SHEET_TPL_PACK_ALIAS_NOTE =
  'Gói thành phần enroll (salary-templates) khác mẫu bảng lương kỳ (pay-sheet-templates).';

export function isValidPaySheetTemplateCodeFormat(code: string): boolean {
  return PAY_SHEET_TPL_CODE_FORMAT.test(code.trim());
}

export function normalizePaySheetTemplateCode(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '_');
}

export function paySheetTemplateStatusLabel(status: string | null | undefined): string {
  const s = String(status ?? '').trim().toLowerCase();
  if ((PAY_SHEET_TPL_STATUSES as readonly string[]).includes(s)) {
    return PAY_SHEET_TPL_STATUS_LABELS[s as PaySheetTemplateStatus];
  }
  return status?.trim() || '—';
}

export function paySheetApplicabilityLabel(scope: string | null | undefined): string {
  const s = String(scope ?? '').trim().toLowerCase();
  if ((PAY_SHEET_TPL_APPLICABILITY as readonly string[]).includes(s)) {
    return PAY_SHEET_TPL_APPLICABILITY_LABELS[s as PaySheetApplicabilityScope];
  }
  return scope?.trim() || '—';
}

export function paySheetLineDisplayLabel(opts: {
  displayLabel?: string | null;
  componentCode?: string | null;
  componentName?: string | null;
}): string {
  const override = opts.displayLabel?.trim();
  if (override) return override;
  const name = opts.componentName?.trim();
  if (name) return name;
  const code = opts.componentCode?.trim();
  if (code) return code;
  return '—';
}

export function formatPaySheetFormulaOverrideLabel(opts: {
  formulaOverrideCode?: string | null;
  formulaOverrideVersion?: number | null;
  formulaOverrideDefinitionId?: string | null;
}): string {
  const code = opts.formulaOverrideCode?.trim();
  if (code) {
    const ver = opts.formulaOverrideVersion;
    return ver != null ? `${code} · v${ver}` : code;
  }
  const id = opts.formulaOverrideDefinitionId?.trim();
  if (id) return `FK · ${id.slice(0, 8)}…`;
  return '— (không override)';
}

export type PaySheetLineDraft = {
  key: string;
  componentId: string;
  displayLabel: string;
  sortOrder: number;
  inputMethod: string;
  systemDataMappingId: string;
  formulaOverrideDefinitionId: string;
  formulaOverrideJson?: Record<string, unknown> | null;
};

export function createEmptyPaySheetLineDraft(sortOrder = 0): PaySheetLineDraft {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    componentId: '',
    displayLabel: '',
    sortOrder,
    inputMethod: 'FORMULA',
    systemDataMappingId: '',
    formulaOverrideDefinitionId: '',
    formulaOverrideJson: null,
  };
}

/** Build PUT body lines[] — definition_id preferred; no FE net / no jsonb invent. */
export type PaySheetTemplateSnapshotJson = {
  template_id?: string;
  template_code?: string;
  template_name?: string;
  columns?: unknown[];
  bound_at?: string;
};

/** Display-ready tên mẫu từ period DTO (snapshot ưu tiên — immutable sau bind). */
export function resolvePaySheetTemplateDisplayFromPeriod(period: {
  pay_sheet_template_id?: string | null;
  paySheetTemplateId?: string | null;
  pay_sheet_template_name?: string | null;
  paySheetTemplateName?: string | null;
  sheet_template_snapshot_json?: PaySheetTemplateSnapshotJson | null;
  sheetTemplateSnapshotJson?: PaySheetTemplateSnapshotJson | null;
}): { id: string | null; name: string; code: string | null } {
  const snapshot = period.sheet_template_snapshot_json ?? period.sheetTemplateSnapshotJson ?? null;
  const id =
    (period.pay_sheet_template_id ?? period.paySheetTemplateId ?? snapshot?.template_id ?? null)?.trim() ||
    null;
  const code = snapshot?.template_code?.trim() || null;
  const explicitName = (
    period.pay_sheet_template_name ??
    period.paySheetTemplateName ??
    snapshot?.template_name
  )?.trim();
  if (explicitName) {
    return { id, name: explicitName, code };
  }
  if (code) {
    return { id, name: code, code };
  }
  if (id) {
    return { id, name: `${id.slice(0, 8)}…`, code: null };
  }
  return { id: null, name: '—', code: null };
}

export function buildPaySheetTemplateLinesPayload(drafts: PaySheetLineDraft[]): {
  ok: true;
  lines: Array<{
    componentId: string;
    displayLabel: string | null;
    sortOrder: number;
    inputMethod: string;
    systemDataMappingId: string | null;
    formulaOverrideDefinitionId: string | null;
    formulaOverrideJson: Record<string, unknown> | null;
  }>;
} | { ok: false; error: string } {
  const seen = new Set<string>();
  const lines: Array<{
    componentId: string;
    displayLabel: string | null;
    sortOrder: number;
    inputMethod: string;
    systemDataMappingId: string | null;
    formulaOverrideDefinitionId: string | null;
    formulaOverrideJson: Record<string, unknown> | null;
  }> = [];

  for (const d of drafts) {
    const componentId = d.componentId.trim();
    if (!componentId) {
      return { ok: false, error: 'Mỗi cột phải chọn thành phần lương từ danh mục.' };
    }
    if (seen.has(componentId)) {
      return { ok: false, error: 'Không được trùng thành phần trên cùng một mẫu.' };
    }
    seen.add(componentId);
    const sortOrder = Number(d.sortOrder);
    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      return { ok: false, error: 'Thứ tự cột (sort_order) phải là số ≥ 0.' };
    }
    lines.push({
      componentId: d.componentId,
      displayLabel: d.displayLabel || undefined,
      sortOrder: d.sortOrder,
      inputMethod: d.inputMethod || 'FORMULA',
      systemDataMappingId: d.systemDataMappingId || undefined,
      formulaOverrideDefinitionId: d.formulaOverrideDefinitionId || undefined,
      formulaOverrideJson: d.formulaOverrideJson || undefined,
    });
  }

  return { ok: true, lines };
}
