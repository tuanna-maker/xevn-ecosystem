/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Thành phần lương — dialog Thêm thành phần
 * UC:         UC-HRM-PAY · salary components
 * BR:         L-OPS · zero-tolerance mã/tên/đơn vị/loại (compliance lương/thuế)
 * SRS:        docs/hrm/SRS.md § lương · docs/qa/evidence/d5-payroll-form-validation-20260728.md
 * TechSpec:   docs/program/UX-UI-ERP-ANALYSIS.md D5 Zod + RHF
 * Purpose:    Schema Zod thuần cho form thêm thành phần lương — tách khỏi shell
 *             Payroll để unit-test được; message i18n inject qua factory.
 * WorkItem:   D-UX-D5-ZOD-TAX-01 · D-UX-D5-ZOD-T-SCOPE-FIX-01 · D-UX-D5-ZOD-LIVE-WIRE-01
 * Coded:      2026-07-28
 * Callers:    SalaryComponentsTab.tsx · vitest salaryComponentFormSchema.test.ts
 * Callees:    zod
 * FE-Actions: | Thêm mới (live tab) | zodResolver + handleSubmit | FormMessage |
 * Impact:     Sai rule → lưu mã trùng / mã rỗng vào thành phần lương;
 *             gọi t() tại module scope → white-screen Payroll (ReferenceError)
 * must_keep:  Không đụng taxSettlementFloatingUi; không đổi API create path;
 *             không import useTranslation trong file này — chỉ nhận messages thuần
 * SOLID:      Pure schema factory — message + existing codes inject từ ngoài
 * LastVerified: docs/qa/evidence/d-ux-d5-zod-live-wire-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-D5-ZOD-T-SCOPE-FIX-01
 * change_mode: FIX
 * What: Khóa factory createSalaryComponentFormSchema(messages) — không bao giờ bind i18n t() trong module
 * Why: Residual QA-UX-UX03-01 white-screen khi schema gọi t ngoài component
 * must_keep: Pure zod; message inject từ caller sau useTranslation
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-D5-ZOD-LIVE-WIRE-01
 * change_mode: FIX
 * What: Caller chuyển sang SalaryComponentsTab (live Add dialog); Payroll orphan Dialog gỡ
 * Why: QA-UX-D5-01 — Zod không nằm user-reachable path
 * must_keep: Pure factory; messages inject từ useTranslation tại tab
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Restore salaryComponentFormSchema (+ sibling payroll form helpers) từ stash 43c479a
 * Why: SalaryComponentsTab Vite miss sau Payroll page transform OK
 * must_keep: pure Zod factory; no useTranslation at module scope
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-FE-ERP-E2-01
 * change_mode: ADD
 * What: Optional getAllowedComponentTypes — componentType ∈ pay_types codes (AC-E2-ZOD-01)
 * Why: FR-HRM-PAY-CLEAN-E2-01 · BR-HRM-PAY-E2-02 — cấm invent nature khi catalog có items
 * must_keep: Pure factory; backward-compat khi getAllowed omit / empty
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: getAllowedCatalogCodes = optional consumer invent-ban helper; **admin** SalaryComponentsTab
 *       passes [] (L-PAY-AC-01 open N+1). Consumer membership SoT = Nest list, not Settings.
 * must_keep: Pure factory; payroll_e2e_ready=false
 */

import { z } from 'zod';

export type SalaryComponentFormMessages = {
  codeRequired: string;
  codeMinLength: string;
  codeFormat: string;
  codeExists: string;
  nameRequired: string;
  nameMinLength: string;
  nameMaxLength: string;
  unitRequired: string;
  typeRequired: string;
  /** When pay_types catalog has items and selection outside effective set. */
  typeNotInCatalog?: string;
  /** When salary_components catalog has items and code outside effective set. */
  codeNotInCatalog?: string;
};

export const SALARY_COMPONENT_CODE_REGEX = /^[A-Z0-9_]+$/;

export const DEFAULT_SALARY_COMPONENT_FORM_VALUES = {
  code: '',
  name: '',
  appliedUnits: [] as string[],
  componentType: '',
  nature: 'income' as const,
  valueType: 'currency' as const,
  isTaxable: true,
  quota: '',
  allowExceedQuota: false,
  formula: '',
  description: '',
};

/**
 * Tạo schema Zod cho form thêm thành phần lương.
 * `getExistingCodes` đọc mã hiện có lúc parse (tránh stale closure khi resolver cố định).
 * `getAllowedComponentTypes` — khi length > 0, componentType phải ∈ pay_types codes.
 * `getAllowedCatalogCodes` — khi length > 0, code phải ∈ salary_components catalog (AC-PAY-COMP-01).
 */
export function createSalaryComponentFormSchema(
  messages: SalaryComponentFormMessages,
  getExistingCodes: () => readonly string[] = () => [],
  getAllowedComponentTypes: () => readonly string[] = () => [],
  getAllowedCatalogCodes: () => readonly string[] = () => [],
) {
  return z
    .object({
      code: z.string().trim().min(1, messages.codeRequired),
      name: z
        .string()
        .trim()
        .min(1, messages.nameRequired)
        .min(3, messages.nameMinLength)
        .max(100, messages.nameMaxLength),
      appliedUnits: z.array(z.string()).min(1, messages.unitRequired),
      componentType: z.string().min(1, messages.typeRequired),
      nature: z.enum(['income', 'deduction', 'other']),
      valueType: z.enum(['currency', 'number', 'percentage']),
      isTaxable: z.boolean(),
      quota: z.string(),
      allowExceedQuota: z.boolean(),
      formula: z.string(),
      description: z.string(),
    })
    .superRefine((data, ctx) => {
      const existing = getExistingCodes();
      if (existing.includes(data.code)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['code'],
          message: messages.codeExists,
        });
      }
      const catalogCodes = getAllowedCatalogCodes();
      if (catalogCodes.length > 0) {
        if (!catalogCodes.includes(data.code)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['code'],
            message: messages.codeNotInCatalog ?? messages.codeFormat,
          });
        }
      } else {
        if (data.code.length < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['code'],
            message: messages.codeMinLength,
          });
        }
        if (!SALARY_COMPONENT_CODE_REGEX.test(data.code)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['code'],
            message: messages.codeFormat,
          });
        }
      }
      const allowed = getAllowedComponentTypes();
      if (
        allowed.length > 0 &&
        data.componentType.trim() &&
        !allowed.includes(data.componentType.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['componentType'],
          message: messages.typeNotInCatalog ?? messages.typeRequired,
        });
      }
    });
}

export type SalaryComponentFormValues = z.infer<
  ReturnType<typeof createSalaryComponentFormSchema>
>;

/** Parse thuần — dùng cho unit test / smoke ngoài RHF. */
export function parseSalaryComponentForm(
  values: unknown,
  messages: SalaryComponentFormMessages,
  existingCodes: readonly string[] = [],
  allowedComponentTypes: readonly string[] = [],
  allowedCatalogCodes: readonly string[] = [],
) {
  return createSalaryComponentFormSchema(
    messages,
    () => existingCodes,
    () => allowedComponentTypes,
    () => allowedCatalogCodes,
  ).safeParse(values);
}
