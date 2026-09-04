import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { buildPayrollEnrollPayload } from '@/lib/payrollEnrollPayload';
import {
  enrichDraftComponentValuesFromEmpCb,
  injectPayrollSheetTotalComponentValues,
  groupPeriodInputLinesByEmployee,
  mapPayslipLinesToComponentValues,
  mergePayrollComponentValues,
  buildAttendanceHoursByEmployee,
  resolveBaseSalaryFromCompensationLines,
  resolveLuongCoBanFromCompensationLines,
  resolveLuongTheoCongDraftPreview,
  type ComponentPreviewSource,
} from '@/lib/payrollBatchSheetColumns';
import { resolvePaySheetTemplateDisplayFromPeriod } from '@/lib/paySheetTemplateCatalog';
import {
  closePayrollPeriod,
  createPayrollPeriod,
  enrollPayrollPeriod,
  getActiveCompensationPackage,
  getPayrollEligibility,
  HrmPayrollPeriod,
  HrmPaySheetTemplatePeriodSnapshot,
  HrmPayslipRow,
  listAttendanceSheetLines,
  listPayrollPeriodInputLines,
  listPayrollPayslipLines,
  listPayrollPeriods,
  listPayrollPayslips,
  listPayrollPeriodTimesheetBinds,
  processPayrollPeriod,
} from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { resolvePayAtt412UserMessage } from '@/lib/payPay01BindRing';

/**
 * @CODE-MEMORY-CHANGE 2026-08-24
 * WorkItem: PO-HRM-PAY-VP-HANOI-BATCH-DETAIL-COLUMNS-01
 * change_mode: FIX
 * What: fetchBatchRecords loads input-lines per enrolled employee_id (parallel) not one global limit=500;
 *       mapPayslipToPayrollRecord derives gross/net from component_values when draft or missing payslip lines
 * Why: VP HN 05/2026 has 700 period input rows — global list truncates → XE00236/XE00250 show 0₫ columns
 *       while stale processed header still showed ~34M gross (not merged salaries — separate payslips)
 * must_keep: mergePayrollComponentValues · has_payslip_lines dotted preview · payroll_e2e_ready=false · no FE formula
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SUMMARY-CARDS-01
 * change_mode: FIX
 * What: resolvePeriodDisplayTotals (payslip_summary) + resolvePayrollHeaderTotals (line aggregate);
 *       lockBatch keeps process result when close 412
 * Why: R-PAY-W3-FE-SUMMARY-ZERO — GET list lacks total_gross/net; process embeds payslip_summary
 * must_keep: no FE formula invent · payroll_e2e_ready=false · process-post GWC · enroll whitelist
 */
export interface ApprovalStep {
  level: number;
  title: string;
  approverName: string;
  approverPosition: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  note?: string;
}

export interface PayrollBatch {
  id: string;
  company_id: string;
  name: string;
  salary_period: string;
  period_month: number;
  period_year: number;
  department: string | null;
  position: string | null;
  /** @deprecated enroll salary_templates pack — use pay_sheet_template_id for AMIS mẫu kỳ */
  template_id: string | null;
  /** AMIS pay-sheet-template bound on create (AC-PAY-TPL-03). */
  pay_sheet_template_id: string | null;
  pay_sheet_template_name: string | null;
  pay_sheet_template_code: string | null;
  /** Immutable column layout from bind — drives batch detail table. */
  sheet_template_snapshot_json?: HrmPaySheetTemplatePeriodSnapshot | null;
  employee_count: number;
  total_gross: number;
  total_deduction: number;
  total_net: number;
  status: 'draft' | 'pending' | 'approved' | 'locked' | 'paid';
  current_approval_level: number;
  approval_steps: ApprovalStep[] | null;
  locked_at: string | null;
  locked_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  payroll_group_id?: string | null;
  payroll_group_code?: string | null;
  payroll_group_name_vi?: string | null;
}

export interface PayrollRecord {
  id: string;
  company_id: string;
  batch_id: string;
  employee_id: string | null;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  base_salary: number;
  allowances: number;
  bonus: number;
  overtime: number;
  insurance_deduction: number;
  tax_deduction: number;
  other_deduction: number;
  gross_salary: number;
  net_salary: number;
  work_days: number;
  actual_work_days: number;
  overtime_hours: number;
  late_days: number;
  leave_days: number;
  component_values: Record<string, number> | null;
  /** True when payroll_payslip_lines exist — false means amounts may come from period input preview. */
  has_payslip_lines: boolean;
  /** Draft preview provenance per component_code (emp_cb vs period input). */
  component_preview_sources?: Partial<Record<string, ComponentPreviewSource>>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollBatchFormData {
  name: string;
  salary_period: string;
  period_month: number;
  period_year: number;
  department?: string;
  position?: string;
  /** Active pay-sheet-template UUID — POST paySheetTemplateId (NOT salary_templates pack). */
  pay_sheet_template_id: string;
  payroll_group_id?: string | null;
  approval_steps?: ApprovalStep[];
}

export function parsePayrollAmount(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Header Gross/Net/Deduction cards — display-ready only.
 * Prefer period totals / process `payslip_summary`; else sum payslip line amounts from API (no FE formula).
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SUMMARY-CARDS-01
 */
export type PayrollHeaderTotalsSource = 'period' | 'payslip_summary' | 'line_aggregate';

export type PayrollHeaderTotals = {
  total_gross: number;
  total_deduction: number;
  total_net: number;
  source: PayrollHeaderTotalsSource;
};

export function resolvePeriodDisplayTotals(item: HrmPayrollPeriod): {
  total_gross: number;
  total_deduction: number;
  total_net: number;
  source: 'period' | 'payslip_summary';
} {
  const summary = item.payslip_summary;
  const summaryGross = parsePayrollAmount(summary?.total_gross);
  const summaryNet = parsePayrollAmount(summary?.total_net);
  const summaryDeduction = parsePayrollAmount(summary?.total_deduction);
  if (summary && (summaryGross > 0 || summaryNet > 0 || summaryDeduction > 0)) {
    return {
      total_gross: summaryGross,
      total_deduction: summaryDeduction > 0 ? summaryDeduction : parsePayrollAmount(item.total_deduction),
      total_net: summaryNet,
      source: 'payslip_summary',
    };
  }
  return {
    total_gross: parsePayrollAmount(item.total_gross),
    total_deduction: parsePayrollAmount(item.total_deduction),
    total_net: parsePayrollAmount(item.total_net),
    source: 'period',
  };
}

export function resolvePayrollHeaderTotals(
  batch: Pick<PayrollBatch, 'total_gross' | 'total_deduction' | 'total_net'>,
  records: Array<
    Pick<
      PayrollRecord,
      'gross_salary' | 'net_salary' | 'insurance_deduction' | 'tax_deduction' | 'other_deduction'
    >
  >,
): PayrollHeaderTotals {
  const periodGross = batch.total_gross || 0;
  const periodNet = batch.total_net || 0;
  const periodDeduction = batch.total_deduction || 0;
  if (periodGross > 0 || periodNet > 0 || periodDeduction > 0) {
    return {
      total_gross: periodGross,
      total_deduction: periodDeduction,
      total_net: periodNet,
      source: 'period',
    };
  }
  const lineGross = records.reduce((sum, row) => sum + (row.gross_salary || 0), 0);
  const lineNet = records.reduce((sum, row) => sum + (row.net_salary || 0), 0);
  const lineDeduction = records.reduce(
    (sum, row) =>
      sum + (row.insurance_deduction || 0) + (row.tax_deduction || 0) + (row.other_deduction || 0),
    0,
  );
  return {
    total_gross: lineGross,
    total_deduction: lineDeduction,
    total_net: lineNet,
    source: 'line_aggregate',
  };
}

/** VN calendar month from API start_date (matches BE-01 eligibility same-month gate). */
export const VN_UTC_OFFSET_MS = 7 * 3600_000;

export function resolvePayrollPeriodCalendarMonth(startDateIso: string): { month: number; year: number } {
  const d = new Date(startDateIso);
  if (Number.isNaN(d.getTime())) {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }
  const vn = new Date(d.getTime() + VN_UTC_OFFSET_MS);
  return { month: vn.getUTCMonth() + 1, year: vn.getUTCFullYear() };
}

export function mapPayrollPeriodToBatch(item: HrmPayrollPeriod): PayrollBatch {
  const { month, year } = resolvePayrollPeriodCalendarMonth(item.start_date);
  const employeeCount = item.employee_count ?? 0;
  const displayTotals = resolvePeriodDisplayTotals(item);
  const tplDisplay = resolvePaySheetTemplateDisplayFromPeriod(item);
  return {
    id: item.id,
    company_id: item.company_id,
    name: item.period_label,
    salary_period: `${String(month).padStart(2, '0')}/${year}`,
    period_month: month,
    period_year: year,
    department: null,
    position: null,
    template_id: null,
    pay_sheet_template_id: tplDisplay.id,
    pay_sheet_template_name: tplDisplay.name,
    pay_sheet_template_code: tplDisplay.code,
    sheet_template_snapshot_json:
      item.sheet_template_snapshot_json ?? item.sheetTemplateSnapshotJson ?? null,
    employee_count: employeeCount,
    total_gross: displayTotals.total_gross,
    total_deduction: displayTotals.total_deduction,
    total_net: displayTotals.total_net,
    status: item.status === 'closed' ? 'locked' : item.status === 'processed' ? 'approved' : 'draft',
    current_approval_level: 0,
    approval_steps: null,
    locked_at: item.closed_at,
    locked_by: null,
    created_by: item.created_by,
    created_at: item.created_at,
    updated_at: item.updated_at,
    payroll_group_id: item.payroll_group_id ?? null,
    payroll_group_code: item.payroll_group_code ?? null,
    payroll_group_name_vi: item.payroll_group_name_vi ?? null,
  };
}

export function mapPayslipToPayrollRecord(
  batchId: string,
  row: HrmPayslipRow,
  componentValues?: Record<string, number> | null,
  opts?: {
    hasPayslipLines?: boolean;
    componentPreviewSources?: Partial<Record<string, ComponentPreviewSource>>;
  },
): PayrollRecord {
  let values =
    componentValues != null && Object.keys(componentValues).length > 0
      ? injectPayrollSheetTotalComponentValues(componentValues)
      : null;
  let gross = parsePayrollAmount(row.gross_amount);
  let deduction = parsePayrollAmount(row.deduction_amount);
  let net = parsePayrollAmount(row.net_amount);
  const hasComponentValues = values != null && Object.keys(values).length > 0;
  if (hasComponentValues && values) {
    gross = values.TONG_THU_NHAP ?? gross;
    net = values.THUC_LINH ?? net;
    deduction = gross - net;
  }
  const baseSalary = values?.LUONG_CO_BAN ?? values?.LUONG_THEO_CONG ?? 0;
  return {
    id: row.id,
    company_id: '',
    batch_id: batchId,
    employee_id: row.employee_id ?? null,
    employee_code: row.employee_code,
    employee_name: row.employee_name,
    department: null,
    position: null,
    base_salary: baseSalary,
    allowances: 0,
    bonus: values?.THUONG_P4 ?? 0,
    overtime: (values?.LUONG_OT_150 ?? 0) + (values?.LUONG_OT_200 ?? 0),
    insurance_deduction: deduction,
    tax_deduction: values?.THUE_TNCN ?? 0,
    other_deduction: 0,
    gross_salary: gross,
    net_salary: net,
    work_days: 0,
    actual_work_days: 0,
    overtime_hours: 0,
    late_days: 0,
    leave_days: 0,
    component_values: values,
    has_payslip_lines: opts?.hasPayslipLines ?? false,
    component_preview_sources: opts?.componentPreviewSources,
    notes: null,
    created_at: '',
    updated_at: '',
  };
}

export type PayrollRecordEmployeeEnrich = {
  id: string;
  department?: string | null;
  position?: string | null;
};

/** Enrich payslip rows with employee master labels (department/position) — API payslip list omits these. */
export function enrichPayrollRecordsFromEmployees(
  records: PayrollRecord[],
  employees: readonly PayrollRecordEmployeeEnrich[],
): PayrollRecord[] {
  if (records.length === 0 || employees.length === 0) return records;
  const byId = new Map(employees.map((e) => [e.id, e]));
  return records.map((record) => {
    if (!record.employee_id) return record;
    const emp = byId.get(record.employee_id);
    if (!emp) return record;
    const department = emp.department?.trim() || record.department;
    const position = emp.position?.trim() || record.position;
    if (!department && !position) return record;
    return {
      ...record,
      department: department ?? record.department,
      position: position ?? record.position,
    };
  });
}

export const usePayrollBatches = (options?: { periodMonth?: number; periodYear?: number }) => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all payroll batches
  const { data: batches = [], isLoading, refetch } = useQuery({
    queryKey: ['payroll-batches', currentCompanyId, options?.periodMonth, options?.periodYear],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const response = await listPayrollPeriods({ company_id: currentCompanyId });
      const data = response.data ?? [];
      const mapped = data.map(mapPayrollPeriodToBatch);

      if (options?.periodMonth && options?.periodYear) {
        return mapped.filter((batch) => batch.period_month === options.periodMonth && batch.period_year === options.periodYear);
      }
      return mapped;
    },
    enabled: !!currentCompanyId,
  });

  // Fetch records for a batch
  const fetchBatchRecords = useCallback(
    async (
      batchId: string,
      opts?: { periodMonth?: number; periodYear?: number },
    ): Promise<PayrollRecord[]> => {
    if (!currentCompanyId) return [];
    const payslipResponse = await listPayrollPayslips({
      company_id: currentCompanyId,
      period_id: batchId,
    });
    const rows = payslipResponse.data ?? [];
    const employeeIds = [
      ...new Set(
        rows.map((row) => row.employee_id).filter((id): id is string => Boolean(id?.trim())),
      ),
    ];
    const inputLineResponses = await Promise.all(
      employeeIds.map((employee_id) =>
        listPayrollPeriodInputLines(batchId, {
          company_id: currentCompanyId,
          employee_id,
          limit: 500,
        }).catch(() => ({ items: [] as const })),
      ),
    );
    const periodInputsByEmployee = groupPeriodInputLinesByEmployee(
      inputLineResponses.flatMap((response) => response.items ?? []),
    );

    let attendanceHoursByEmployee = new Map<
      string,
      { payableHours: number; standardHours: number }
    >();
    try {
      const bindsResponse = await listPayrollPeriodTimesheetBinds(batchId);
      const closedBind = (bindsResponse.items ?? []).find(
        (bind) => String(bind.timesheetStatus ?? '').trim().toLowerCase() === 'closed',
      );
      if (closedBind?.timesheetHeaderId) {
        const linesResponse = await listAttendanceSheetLines(
          closedBind.timesheetHeaderId,
          currentCompanyId,
        );
        attendanceHoursByEmployee = buildAttendanceHoursByEmployee(linesResponse.items ?? [], {
          sheetClosed: String(linesResponse.status ?? '').trim().toLowerCase() === 'closed',
        });
      }
    } catch {
      // attendance hours preview is best-effort for draft display
    }

    const asOfDate =
      opts?.periodYear != null && opts?.periodMonth != null
        ? format(endOfMonth(new Date(opts.periodYear, opts.periodMonth - 1, 1)), 'yyyy-MM-dd')
        : undefined;

    const records = await Promise.all(
      rows.map(async (row) => {
        const periodInputValues =
          row.employee_id != null ? (periodInputsByEmployee.get(row.employee_id) ?? {}) : {};
        const rawLines = Array.isArray((row as any).lines)
          ? (row as any).lines
          : Array.isArray((row as any).components)
            ? (row as any).components
            : [];
        let hasPayslipLines = (row as any).has_payslip_lines ?? rawLines.length > 0;
        let payslipLineValues: Record<string, number> =
          (row as any).component_values ?? (row as any).componentValues ?? {};

        if (!hasPayslipLines && rawLines.length > 0) {
          hasPayslipLines = true;
          payslipLineValues = mapPayslipLinesToComponentValues(rawLines);
        } else if (!hasPayslipLines && !Object.keys(payslipLineValues).length) {
          try {
            const linesResponse = await listPayrollPayslipLines(row.id, {
              company_id: currentCompanyId,
            });
            const lines = linesResponse.data ?? [];
            hasPayslipLines = lines.length > 0;
            payslipLineValues = mapPayslipLinesToComponentValues(lines);
          } catch {
            payslipLineValues = {};
          }
        }
        let componentValues = mergePayrollComponentValues(payslipLineValues, periodInputValues);
        let componentPreviewSources: Partial<Record<string, ComponentPreviewSource>> | undefined;

        if (!hasPayslipLines && row.employee_id) {
          try {
            const pkg = await getActiveCompensationPackage({
              company_id: currentCompanyId,
              employee_id: row.employee_id,
              as_of: asOfDate,
            });
            const lines = pkg?.lines ?? [];
            const luongCoBan = lines.length
              ? resolveLuongCoBanFromCompensationLines(lines)
              : 0;
            const empCbPreview: Record<string, number> = {};
            if (luongCoBan > 0) empCbPreview.LUONG_CO_BAN = luongCoBan;

            const attHours = attendanceHoursByEmployee.get(row.employee_id);
            const baseSalary = lines.length
              ? resolveBaseSalaryFromCompensationLines(lines)
              : 0;
            const luongTheoCong =
              attHours && baseSalary > 0
                ? resolveLuongTheoCongDraftPreview(
                    baseSalary,
                    attHours.payableHours,
                    attHours.standardHours,
                  )
                : 0;

            if (Object.keys(empCbPreview).length > 0) {
              const enriched = enrichDraftComponentValuesFromEmpCb(
                componentValues,
                empCbPreview,
              );
              componentValues = enriched.values;
              componentPreviewSources = enriched.previewSources;
            }
            if (luongTheoCong > 0 && (componentValues.LUONG_THEO_CONG ?? 0) === 0) {
              componentValues = { ...componentValues, LUONG_THEO_CONG: luongTheoCong };
              componentPreviewSources = {
                ...componentPreviewSources,
                LUONG_THEO_CONG: 'formula_preview',
              };
            }
          } catch {
            // emp_cb preview is best-effort for draft display
          }
        }

        return mapPayslipToPayrollRecord(batchId, row, componentValues, {
          hasPayslipLines,
          componentPreviewSources,
        });
      }),
    );
    return records;
  },
    [currentCompanyId],
  );

  // Create batch mutation
  const createBatchMutation = useMutation({
    mutationFn: async (formData: PayrollBatchFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');
      const startDate = startOfMonth(new Date(formData.period_year, formData.period_month - 1, 1));
      const endDate = endOfMonth(startDate);
      return createPayrollPeriod({
        company_id: currentCompanyId,
        period_label: formData.name,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        paySheetTemplateId: formData.pay_sheet_template_id,
        payroll_group_id: formData.payroll_group_id ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã tạo bảng lương');
    },
    onError: (error: unknown) => {
      const message = toErrorMessage(error, 'Lỗi khi tạo bảng lương');
      if (error instanceof ApiClientError && error.code === 'HRM-PAY-002') {
        toast.error(
          `${message} Mở kỳ lương đã có trong danh sách (vd. Kỳ lương VP Hà Nội 05/2026) thay vì tạo mới.`,
        );
        return;
      }
      if (error instanceof ApiClientError && error.code === 'SCOPE_CONTEXT_MISMATCH') {
        toast.error(
          `${message} Đăng nhập user cùng tenant với URL (?tenantId=xevn cần tài khoản tenant xevn).`,
        );
        return;
      }
      toast.error(message || 'Lỗi khi tạo bảng lương');
    },
  });

  // Update batch mutation
  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PayrollBatch> }) => {
      void id;
      void data;
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã cập nhật bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật bảng lương');
    },
  });

  // Delete batch mutation
  const deleteBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      void id;
      throw new Error('Xóa kỳ lương chưa được hỗ trợ bởi HRM payroll API.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã xóa bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi xóa bảng lương');
    },
  });

  // Lock batch = process (required) + close (best-effort; HRM-PAY-005 may 412 after process)
  const lockBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const processed = await processPayrollPeriod(id, currentCompanyId ?? undefined);
      try {
        await closePayrollPeriod(id, currentCompanyId ?? undefined);
      } catch (closeError) {
        // Period already processed — keep payslip_summary for header cards; close is separate spine.
        console.warn('[payroll] close after process skipped', closeError);
      }
      return processed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['payroll-payslips', currentCompanyId] });
      toast.success('Đã khóa bảng lương');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiClientError && error.code === 'HRM-PAY-ATT-412') {
        toast.error(resolvePayAtt412UserMessage(error.code, error.message));
        return;
      }
      if (error instanceof ApiClientError && error.code === 'HRM-PAY-409') {
        toast.error(
          `${toErrorMessage(error, 'Lỗi khi khóa bảng lương')} Đăng nhập đúng tenant (vd. ceo@xe.vn → xevn) và URL ?tenantId=xevn khớp JWT.`,
        );
        return;
      }
      toast.error(toErrorMessage(error, 'Lỗi khi khóa bảng lương'));
    },
  });

  // Add record(s) to batch — one enroll POST; body whitelist (no company_id — JWT scope)
  const addRecordMutation = useMutation({
    mutationFn: async ({ batchId, employeeIds }: { batchId: string; employeeIds: string[] }) => {
      if (employeeIds.length < 1) {
        throw new Error('Chưa chọn nhân viên để thêm.');
      }
      const response = await enrollPayrollPeriod(batchId, buildPayrollEnrollPayload(employeeIds));
      if ((response.enrolled ?? []).length < 1) {
        throw new Error('Kỳ lương chưa ghi nhận nhân viên sau khi thêm.');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['payroll-payslips', currentCompanyId] });
      toast.success('Đã thêm nhân viên vào bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi thêm nhân viên');
    },
  });

  // Update record
  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, batchId, data }: { id: string; batchId: string; data: Partial<PayrollRecord> }) => {
      void id;
      void batchId;
      void data;
      throw new Error('Cập nhật bản ghi lương chưa được hỗ trợ bởi HRM payroll API.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã cập nhật bản ghi lương');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật bản ghi');
    },
  });

  // Delete record
  const deleteRecordMutation = useMutation({
    mutationFn: async ({ id, batchId }: { id: string; batchId: string }) => {
      void id;
      void batchId;
      throw new Error('Xóa bản ghi lương chưa được hỗ trợ bởi HRM payroll API.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã xóa bản ghi lương');
    },
    onError: () => {
      toast.error('Lỗi khi xóa bản ghi');
    },
  });

  return {
    batches,
    isLoading,
    refetch,
    fetchBatchRecords,
    createBatch: createBatchMutation.mutateAsync,
    updateBatch: updateBatchMutation.mutateAsync,
    deleteBatch: deleteBatchMutation.mutateAsync,
    lockBatch: lockBatchMutation.mutateAsync,
    addRecord: addRecordMutation.mutateAsync,
    updateRecord: updateRecordMutation.mutateAsync,
    deleteRecord: deleteRecordMutation.mutateAsync,
    isCreating: createBatchMutation.isPending,
  };
};

export function usePayrollPeriodEligibility(periodId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['payroll-eligibility', periodId],
    queryFn: () => getPayrollEligibility(periodId!),
    enabled: Boolean(periodId && enabled),
    staleTime: 30_000,
  });
}
