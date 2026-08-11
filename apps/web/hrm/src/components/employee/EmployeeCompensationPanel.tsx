/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Contracts → tab Đãi ngộ
 * UC:         UC-HRM-CI-08 · UC-HRM-CI-11 · AC-CD-F5-02..04
 * BR:         BR-CD-F5-02..05
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 * TechSpec:   docs/api/openapi/hrm-api.yaml createCompensationPackage / revise
 * Purpose:    UI to create/revise compensation package (base + probation + ≥2
 *             allowances). Raise salary via revise (new version), not edit lines.
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 * Callers:    EmployeeContracts.tsx (tab Đãi ngộ)
 * Callees:    useEmployeeCompensation · buildCompensationLines
 * must_keep:  Probation only when contract/NV probation (HRM-COMP-002)
 * LastVerified: EmployeeCompensationPanel.test.ts · compensationLines.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 D-UX-VI-FORMAT-HRM-01
 * what: ViMoneyInput for base/probation/allowance; Calendar dd/MM/yyyy effective
 * why: Sponsor VI thousand-group + date display lock (UX_VI_DATE_NUMBER_FORMAT_AC)
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 D-UX-VI-COMP-PANEL-LINES-MAP-01
 * what: compensationPackageLines guard — active package may omit lines array
 * why: QA-UX-VI-FORMAT-01 P0 crash active.lines.map when lines undefined
 */

import { useEffect, useMemo, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { CalendarIcon, Loader2, Plus, RefreshCcw, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { XBOS_ALLOWANCE_CODE_OPTIONS } from '@/lib/compensationAllowanceCodes';
import { resolveAllowanceCodeDisplayLabel, resolveCompensationLineTypeDisplay } from '@/lib/labelMaps';
import {
  buildCompensationLines,
  isProbationContractType,
  type AllowanceDraft,
} from '@/lib/compensationLines';
import { useEmployeeCompensation } from '@/hooks/useEmployeeCompensation';
import { HrmListLoadBanner } from '@/components/hrm/HrmListLoadBanner';
import {
  ViMoneyInput,
  amountStringToNumber,
  numberToAmountString,
} from '@/components/ui/ViMoneyInput';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import { cn } from '@/lib/utils';

type ContractLite = {
  id: string;
  contract_type: string;
  status: string;
  compensation_package_id?: string | null;
};

type Props = {
  employeeId: string;
  contracts: ContractLite[];
};

const emptyAllowances = (): AllowanceDraft[] => [
  { allowance_code: 'PHU_CAP_AN', amount: '' },
  { allowance_code: 'PHU_CAP_XANG', amount: '' },
];

function formatVnd(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

function lineTypeLabel(lineType: string): string {
  return resolveCompensationLineTypeDisplay(lineType);
}

/** API may return active package header without embedded lines — never assume .lines exists. */
export function compensationPackageLines(
  pkg: { lines?: Array<{ id?: string; line_type: string; amount: number | string; allowance_code?: string | null }> } | null | undefined,
) {
  return Array.isArray(pkg?.lines) ? pkg.lines : [];
}

export function EmployeeCompensationPanel({ employeeId, contracts }: Props) {
  const {
    active,
    packages,
    isLoading,
    fetchError,
    refetch,
    createPackage,
    revisePackage,
  } = useEmployeeCompensation(employeeId);

  const activeContract = useMemo(
    () =>
      contracts.find((c) => c.status === 'active') ??
      contracts.find((c) => c.status === 'pending') ??
      contracts[0],
    [contracts],
  );

  const activeLines = useMemo(() => compensationPackageLines(active), [active]);

  const probationAllowed = useMemo(
    () => contracts.some((c) => isProbationContractType(c.contract_type)),
    [contracts],
  );

  const [baseAmount, setBaseAmount] = useState('');
  const [probationAmount, setProbationAmount] = useState('');
  const [includeProbation, setIncludeProbation] = useState(false);
  const [allowances, setAllowances] = useState<AllowanceDraft[]>(emptyAllowances);
  const [changeReason, setChangeReason] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIncludeProbation(probationAllowed);
  }, [probationAllowed]);

  useEffect(() => {
    if (!activeLines.length) return;
    const base = activeLines.find((l) => l.line_type === 'base');
    const probation = activeLines.find((l) => l.line_type === 'probation');
    const allowanceLines = activeLines.filter((l) => l.line_type === 'allowance');
    if (base) setBaseAmount(String(base.amount));
    if (probation) {
      setIncludeProbation(true);
      setProbationAmount(String(probation.amount));
    }
    if (allowanceLines.length >= 2) {
      setAllowances(
        allowanceLines.map((l) => ({
          allowance_code: l.allowance_code ?? '',
          amount: String(l.amount),
        })),
      );
    }
  }, [active?.id, activeLines]);

  const updateAllowance = (index: number, patch: Partial<AllowanceDraft>) => {
    setAllowances((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addAllowanceRow = () => {
    const used = new Set(allowances.map((a) => a.allowance_code));
    const next = XBOS_ALLOWANCE_CODE_OPTIONS.find((o) => !used.has(o.code));
    setAllowances((prev) => [
      ...prev,
      { allowance_code: next?.code ?? 'PHU_CAP_TRACH_NHIEM', amount: '' },
    ]);
  };

  const removeAllowanceRow = (index: number) => {
    if (allowances.length <= 2) {
      toast.error('Giữ tối thiểu 2 dòng phụ cấp');
      return;
    }
    setAllowances((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (mode: 'create' | 'revise') => {
    if (includeProbation && !probationAllowed) {
      toast.error('Lương thử việc chỉ khi HĐ/NV đang thử việc');
      return;
    }
    const built = buildCompensationLines({
      baseAmount,
      probationAmount,
      includeProbation,
      allowances,
      changeReason,
      effectiveFrom,
    });
    if (!built.ok) {
      toast.error(built.error);
      return;
    }
    if (!effectiveFrom) {
      toast.error('Chọn ngày hiệu lực');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'revise') {
        if (!active?.id) {
          toast.error('Chưa có gói active — hãy tạo gói mới trước');
          return;
        }
        await revisePackage({
          packageId: active.id,
          effective_from: effectiveFrom,
          lines: built.lines,
          change_reason: changeReason.trim() || 'Điều chỉnh đãi ngộ',
        });
      } else {
        await createPackage({
          effective_from: effectiveFrom,
          lines: built.lines,
          change_reason: changeReason.trim() || 'Tạo gói đãi ngộ',
          contract_id: activeContract?.id,
          link_to_contract: Boolean(activeContract?.id),
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <HrmListLoadBanner loadFailed={Boolean(fetchError)} errorMessage={fetchError} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5" />
            Gói đãi ngộ hiện hành
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !active ? (
            <p className="text-sm text-muted-foreground py-4">
              Chưa có gói đãi ngộ đang áp dụng. Tạo gói bên dưới (lương không nhập trên form hợp đồng).
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">v{active.version}</Badge>
                <span>
                  Hiệu lực: {formatDisplayDate(active.effective_from)}
                  {active.effective_to
                    ? ` → ${formatDisplayDate(active.effective_to)}`
                    : ' → hiện tại'}
                </span>
              </div>
              {activeLines.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Gói đang áp dụng chưa có chi tiết dòng lương/phụ cấp. Dùng form bên dưới để điều chỉnh.
                </p>
              ) : (
                <ul className="divide-y rounded-input border">
                  {activeLines.map((line, idx) => (
                    <li
                      key={line.id ?? `${line.line_type}-${idx}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span>
                        {lineTypeLabel(line.line_type)}
                        {line.allowance_code ? (
                          <span className="text-muted-foreground"> · {resolveAllowanceCodeDisplayLabel(line.allowance_code)}</span>
                        ) : null}
                      </span>
                      <span className="font-medium">{formatVnd(Number(line.amount))}</span>
                    </li>
                  ))}
                </ul>
              )}
              {packages.length > 1 ? (
                <p className="text-xs text-muted-foreground">
                  {packages.length} phiên bản gói — xem tab «Lịch sử» để theo dõi thay đổi.
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {active ? 'Điều chỉnh / tăng lương (revise)' : 'Tạo gói đãi ngộ'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Bắt buộc lương cơ bản + ≥2 phụ cấp mã DM §33. Tăng lương tạo phiên bản mới — không ghi đè dòng cũ.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Ngày hiệu lực *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !effectiveFrom && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {effectiveFrom
                      ? formatDisplayDate(effectiveFrom)
                      : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      effectiveFrom && isValid(parseISO(effectiveFrom))
                        ? parseISO(effectiveFrom)
                        : undefined
                    }
                    onSelect={(d) =>
                      setEffectiveFrom(d ? format(d, 'yyyy-MM-dd') : '')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Lý do thay đổi</Label>
              <Input
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Tăng lương định kỳ / điều chỉnh phụ cấp"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Lương cơ bản (base) * — VNĐ</Label>
              <ViMoneyInput
                value={amountStringToNumber(baseAmount)}
                onValueChange={(n) => setBaseAmount(numberToAmountString(n))}
                placeholder="15.000.000"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="include-probation"
                  checked={includeProbation}
                  disabled={!probationAllowed}
                  onCheckedChange={(v) => setIncludeProbation(v === true)}
                />
                <Label htmlFor="include-probation" className={!probationAllowed ? 'text-muted-foreground' : ''}>
                  Lương thử việc (probation)
                </Label>
              </div>
              <ViMoneyInput
                disabled={!includeProbation}
                value={amountStringToNumber(probationAmount)}
                onValueChange={(n) => setProbationAmount(numberToAmountString(n))}
                placeholder={probationAllowed ? '12.000.000' : 'Chỉ khi HĐ thử việc'}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Phụ cấp (≥2 mã khác nhau)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAllowanceRow}>
                <Plus className="mr-1 h-4 w-4" />
                Thêm dòng
              </Button>
            </div>
            {allowances.map((row, index) => (
              <div key={`${row.allowance_code}-${index}`} className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Select
                    value={row.allowance_code}
                    onValueChange={(value) => updateAllowance(index, { allowance_code: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mã phụ cấp" />
                    </SelectTrigger>
                    <SelectContent>
                      {XBOS_ALLOWANCE_CODE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-5">
                  <ViMoneyInput
                    value={amountStringToNumber(row.amount)}
                    onValueChange={(n) =>
                      updateAllowance(index, { amount: numberToAmountString(n) })
                    }
                    placeholder="500.000"
                  />
                </div>
                <div className="col-span-2 flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeAllowanceRow(index)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {!active ? (
              <Button disabled={submitting} onClick={() => void submit('create')}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Tạo gói đãi ngộ
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={submitting}
                  onClick={() => void submit('create')}
                >
                  Tạo gói mới (không link HĐ)
                </Button>
                <Button disabled={submitting} onClick={() => void submit('revise')}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Tăng lương / revise
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
