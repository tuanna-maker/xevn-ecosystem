/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — dialog gắn hồ sơ khi chốt «Đã tuyển»
 * UC:         UC-HRM-INT-01
 * BR:         G-DB-01 · FR-HRM-INT-01 Diễn biến #3/#5/#7 · BM-AC-07
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.33 · FR-HRM-INT-01
 * TechSpec:   docs/hrm/TECHSPEC.md §17.3 G-DB-01
 * Purpose:    Bắt buộc chọn hồ sơ NV cùng đơn vị trước khi PATCH stage=hired (employee_id).
 * WorkItem:   FE-HRM-G-DB-01-HIRE-BIND-01
 * Coded:      2026-07-21
 * Callers:    CandidatesTab · JobCandidatesDialog · Recruitment (kanban) · CandidateFormDialog
 * Callees:    useEmployees (picker capped) · recruitmentHireLink copy · formatEmployeePickerLabel
 * must_keep:  G-DB-01 hire bind dialog · leave CREATE · U65 · không tạo NV giả
 * SOLID:      Dialog thuần confirm — caller gửi API
 * LastVerified: docs/qa/evidence/bm-fe-hire-title-01-20260722.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BM-FE-HIRE-TITLE-01
 *   SelectItem hiện chức vụ (position/job_title_key) qua formatEmployeePickerLabel — không chỉ dept null.
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-REC-A
 * change_mode: UPGRADE
 * What: Precision Motion chrome — Dialog glass/wordmark/brand bar; title ≥20; compact select; sharp labels
 * Why: ADR §16 · inventory R15 Hire→Employee · ui-neo dialog neo
 * must_keep: G-DB-01 hire bind wire · no invent employee · U65 · no Nest/API invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 */
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmployees } from '@/hooks/useEmployees';
import { formatEmployeePickerLabel } from '@/lib/employeePickerLabel';
import { HRM_REC_HIRE_400_VI } from '@/lib/recruitmentHireLink';

export type HireEmployeeLinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  /** Pre-select when candidate already has soft employee_id. */
  initialEmployeeId?: string | null;
  submitting?: boolean;
  onConfirm: (employeeId: string) => void | Promise<void>;
};

export function HireEmployeeLinkDialog({
  open,
  onOpenChange,
  candidateName,
  initialEmployeeId,
  submitting = false,
  onConfirm,
}: HireEmployeeLinkDialogProps) {
  const { employees, isLoading, isCapped, total } = useEmployees(undefined, { enabled: open });
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedId(initialEmployeeId?.trim() || '');
  }, [open, initialEmployeeId]);

  const handleConfirm = async () => {
    const id = selectedId.trim();
    if (!id) return;
    await onConfirm(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[520px]"
        data-testid="rec-hire-employee-link-dialog-precision"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-[20px] font-bold text-xevn-text">
            Gắn hồ sơ nhân viên
          </DialogTitle>
          <DialogDescription className="text-xevn-textSecondary">
            Chốt tuyển «{candidateName}» cần mã hồ sơ cùng đơn vị (FR-HRM-INT-01).{' '}
            {HRM_REC_HIRE_400_VI}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="hire-employee-select" className="text-sm font-semibold text-xevn-text">
            Hồ sơ nhân viên
          </Label>
          {isLoading ? (
            <div className="flex items-center gap-2 py-2 text-sm text-xevn-textSecondary">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Đang tải danh sách nhân viên…
            </div>
          ) : (
            <Select value={selectedId || undefined} onValueChange={setSelectedId}>
              <SelectTrigger id="hire-employee-select" className="xevn-field-name w-full">
                <SelectValue placeholder="— Chọn hồ sơ nhân viên —" />
              </SelectTrigger>
              <SelectContent>
                {employees.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    Chưa có hồ sơ — tạo nhân viên trước rồi quay lại
                  </SelectItem>
                ) : (
                  employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {formatEmployeePickerLabel(emp)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          {isCapped && typeof total === 'number' && total > employees.length ? (
            <p className="text-xs text-xevn-textSecondary">
              Đang hiển thị {employees.length}/{total} hồ sơ — thu hẹp phạm vi đơn vị nếu không thấy hồ sơ đích.
            </p>
          ) : null}
        </div>

        <DialogFooter className="xevn-dialog-footer-sticky gap-2 sm:gap-0">
          <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={submitting || !selectedId.trim() || selectedId === '__empty'}
            onClick={() => void handleConfirm()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang chốt…
              </>
            ) : (
              'Xác nhận chốt tuyển'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
