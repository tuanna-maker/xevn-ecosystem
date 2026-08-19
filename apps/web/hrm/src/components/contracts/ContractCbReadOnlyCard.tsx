/**
 * @CODE-MEMORY
 * Screen:     /contracts wizard — C&B card (read-only | bootstrap | masked)
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-01 · BR-CD-F5-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-12 D-FE-CTR-CB-BOOT-01
 * What: 3 trạng thái RO | bootstrap | masked. Bootstrap = 2 ô tiền vi-VN riêng
 *       (Lương cơ bản + Lương đóng BH, không auto-copy — sponsor §10b). RO có số → CTA «Mở C&B».
 *       Masked (cb_masked / thiếu quyền) → banner, không lộ số, không input.
 * UC: BR-CTR-CB-BOOT-01/03/04 · AC-CTR-CB-RO-01 · AC-CTR-CB-BOOT-01/03 · AC-CTR-CB-MASK-01 · AC-CTR-CB-LINK-01
 * must_keep: AC-CTR-FIELD-04 — KHÔNG «+ Thêm» phụ cấp GĐ1 (chỉ 2 ô cố định);
 *            RO khi đã có active package (O10 RETAIN); testid ctr-create-cb-card giữ nguyên.
 * SOLID: Presentational — không tự POST; giá trị bootstrap do wizard sở hữu + orchestrate.
 */
import { Link } from 'react-router-dom';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { ContractCreateContextSnapshot } from '@/lib/contractCreateApi';
import type { ContractCbBootstrapDraft } from '@/lib/contractCreateApi';

function formatMoneyVnd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString('vi-VN');
}

export type ContractCbCardState = 'ro' | 'bootstrap' | 'masked';

export type ContractCbReadOnlyCardProps = {
  snapshot: ContractCreateContextSnapshot['compensation_snapshot'] | null;
  /** cb_masked / thiếu quyền C&B — banner, không lộ số (AC-CTR-CB-MASK-01). */
  cbMasked?: boolean;
  /** Snapshot rỗng + NV + AuthZ → bootstrap 2 ô (BR-CTR-CB-BOOT-01). */
  bootstrapEligible?: boolean;
  bootstrap?: ContractCbBootstrapDraft;
  onBootstrapChange?: (patch: Partial<ContractCbBootstrapDraft>) => void;
  /** RO có số → link hồ sơ C&B (AC-CTR-CB-LINK-01). */
  openCbHref?: string;
};

export function ContractCbReadOnlyCard({
  snapshot,
  cbMasked = false,
  bootstrapEligible = false,
  bootstrap,
  onBootstrapChange,
  openCbHref,
}: ContractCbReadOnlyCardProps) {
  const state: ContractCbCardState = cbMasked
    ? 'masked'
    : bootstrapEligible
      ? 'bootstrap'
      : 'ro';

  if (state === 'masked') {
    return (
      <div
        className="rounded-card border border-amber-200 bg-amber-50 p-4 space-y-1"
        data-testid="ctr-create-cb-card"
        data-cb-state="masked"
      >
        <p className="text-sm font-medium text-amber-900">Lương & bảo hiểm</p>
        <p className="text-sm text-amber-900" data-testid="ctr-create-cb-masked-banner" role="status">
          Bạn không đủ quyền xem hoặc nhập lương & bảo hiểm của nhân viên này. Liên hệ bộ phận C&B / HCNS có quyền.
        </p>
      </div>
    );
  }

  if (state === 'bootstrap') {
    const draft = bootstrap ?? { base_salary_vnd: 0, insurance_salary_vnd: 0 };
    return (
      <div
        className="rounded-card border bg-slate-50/80 p-4 space-y-3"
        data-testid="ctr-create-cb-card"
        data-cb-state="bootstrap"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Lương & bảo hiểm (khởi tạo cho nhân viên mới)</p>
          <p className="text-xs text-muted-foreground">
            Nhân viên chưa có gói C&B. Nhập hai mức lương để hệ thống tạo gói đầu tiên khi lưu hợp đồng.
          </p>
        </div>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-6 space-y-1.5">
            <Label htmlFor="ctr-create-cb-base-input" className="text-xs text-muted-foreground">
              Lương cơ bản *
            </Label>
            <ViMoneyInput
              id="ctr-create-cb-base-input"
              className="h-10 text-base"
              value={draft.base_salary_vnd}
              onValueChange={(next) => onBootstrapChange?.({ base_salary_vnd: next })}
              placeholder="0"
              aria-label="Lương cơ bản"
              data-testid="ctr-create-cb-base-input"
            />
          </div>
          <div className="col-span-6 space-y-1.5">
            <Label htmlFor="ctr-create-cb-insurance-input" className="text-xs text-muted-foreground">
              Lương đóng BH *
            </Label>
            <ViMoneyInput
              id="ctr-create-cb-insurance-input"
              className="h-10 text-base"
              value={draft.insurance_salary_vnd}
              onValueChange={(next) => onBootstrapChange?.({ insurance_salary_vnd: next })}
              placeholder="0"
              aria-label="Lương đóng bảo hiểm"
              data-testid="ctr-create-cb-insurance-input"
            />
          </div>
        </div>
      </div>
    );
  }

  const snap = snapshot ?? {
    base_salary_vnd: null,
    insurance_salary_vnd: null,
    salary_ratio_percent: null,
  };
  const hasNumbers = snap.base_salary_vnd != null || snap.insurance_salary_vnd != null;
  return (
    <div
      className="rounded-card border bg-slate-50/80 p-4 space-y-3"
      data-testid="ctr-create-cb-card"
      data-cb-state="ro"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Lương & bảo hiểm (read-only)</p>
        {hasNumbers && openCbHref ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            asChild
          >
            <Link to={openCbHref} data-testid="ctr-create-cb-open-link">
              Mở C&B
            </Link>
          </Button>
        ) : null}
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4 space-y-1">
          <p className="text-xs text-muted-foreground">Lương cơ bản</p>
          <p className="text-sm font-medium tabular-nums">{formatMoneyVnd(snap.base_salary_vnd)}</p>
        </div>
        <div className="col-span-4 space-y-1">
          <p className="text-xs text-muted-foreground">Lương đóng BH</p>
          <p className="text-sm font-medium tabular-nums">
            {formatMoneyVnd(snap.insurance_salary_vnd)}
          </p>
        </div>
        <div className="col-span-4 space-y-1">
          <p className="text-xs text-muted-foreground">Tỉ lệ hưởng lương</p>
          <p className="text-sm font-medium tabular-nums">
            {snap.salary_ratio_percent != null ? `${snap.salary_ratio_percent}%` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
