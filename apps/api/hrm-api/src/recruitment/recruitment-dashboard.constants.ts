/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng → Dashboard («bao giờ đủ người»)
 * UC:         UC-BP-REC-08 · FR-UC-BP-REC-08
 * BR:         O1–O10 · VAL-REC-DASH-01..19 · OPEN_YCTD_STATUS_SET · funnel §4.1
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-08 Diễn biến #1–#3
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md §4–§8
 * Purpose:    Constants / error tokens / funnel keys for Nest recruitment dashboard read-model.
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment-dashboard.service.ts · recruitment-dashboard.formulas.ts
 * Callees:    (none)
 * FEActions:  GET /recruitment/dashboard* bind only
 * Impact:     Wrong OPEN set → ETA/open_yctd drift; omit funnel key → FE FAIL O4
 * must_keep:  5 funnel keys always · OPEN set peer REC-02 receivable · no C&B tokens
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-be-01.md
 */

export const HRM_REC_DASH_200 = 'HRM-REC-DASH-200';
export const HRM_REC_DASH_PERIOD_400 = 'HRM-REC-DASH-PERIOD-400';
export const HRM_REC_DASH_METHOD_405 = 'HRM-REC-DASH-METHOD-405';
export const HRM_REC_DASH_VAL_400 = 'HRM-REC-DASH-VAL-400';
/**
 * Scope mismatch — RETAIN family (VAL-02 · API-01 §8).
 *
 * Hai lớp 409 khác nhau, KHÔNG phải trùng token:
 *  1. `SCOPE_CONTEXT_MISMATCH` — resolver nền tảng (`common/scope-context.ts` qua
 *     `resolveHrmListScope`): `company_id` hint ≠ claim JWT. Dashboard read-only chỉ
 *     đi qua lớp này, nên **runtime token của GET dashboard là `SCOPE_CONTEXT_MISMATCH`**.
 *  2. `HRM-SCOPE-409` — `assertResourceInHrmScope` mismatchCode ở tầng get-by-id
 *     (jd-dynamic, rec-pipeline-stage…): hàng đã đọc lệch scope đã resolve.
 *
 * API-01 ghi «HRM-SCOPE-409 (RETAIN family)» là **nhãn họ lỗi** của pattern list plans,
 * không phải literal của dashboard. Giữ nguyên `SCOPE_CONTEXT_MISMATCH` ở runtime vì đó
 * là hợp đồng nền tảng đã seal (`common/scope-context.spec.ts`, ma trận QA mọi module,
 * bản đồ lỗi VI của FE) — đổi sẽ vỡ consumer ngoài phạm vi REC-08.
 * Hằng số này giữ lại cho traceability API-01 §8; dashboard không tự ném token này.
 */
export const HRM_SCOPE_409 = 'HRM-SCOPE-409';

/** API-01 §4.2 — dashboard open YCTD (read). */
export const OPEN_YCTD_STATUS_SET = ['open_for_hire', 'open', 'approved'] as const;
export type OpenYctdStatus = (typeof OPEN_YCTD_STATUS_SET)[number];

export const FUNNEL_KEYS = ['cv', 'screening', 'interview', 'offer', 'onboard'] as const;
export type FunnelKey = (typeof FUNNEL_KEYS)[number];

export const DEFAULT_FUNNEL_LABELS_VI: Record<FunnelKey, string> = {
  cv: 'Hồ sơ / CV',
  screening: 'Sàng lọc',
  interview: 'Phỏng vấn',
  offer: 'Offer',
  onboard: 'Onboard / Đã tuyển',
};

export type EnoughPeopleStatus = 'no_plan' | 'enough' | 'in_progress' | 'at_risk';

export const EMPTY_GUIDE_NO_PLAN = {
  code: 'NO_APPROVED_HEADCOUNT',
  title: 'Chưa có định biên đã duyệt trong kỳ',
  body: 'Tạo và duyệt định biên (Cần tuyển) trước khi theo dõi «bao giờ đủ người».',
  cta_hint: 'Mở Định biên nhân sự',
} as const;

export const ETA_LABEL_UNKNOWN = 'Chưa xác định thời điểm đủ người';

/** FORBIDDEN response field substrings (O10 · VAL-11). */
export const FORBIDDEN_DASHBOARD_FIELD_RE =
  /^(offer_salary|salary_|c_and_b_|compensation_|bank_|mst$|tax_code$|cost_)/i;
