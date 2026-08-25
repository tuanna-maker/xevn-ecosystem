import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import {
  listDepartmentPositions,
  listPayPositions,
  removeDepartmentPosition,
  upsertDepartmentPosition,
  type HrmDepartmentPositionRecord,
  type HrmPayPositionRecord,
} from '@/integrations/hrmApi';
import { isDepartmentUuid } from '@/lib/companyDepartmentMutate';
import { isGroupCeoDepartmentRollupContext } from '@/lib/hrmDepartmentCatalog';
import type { CatalogDepartmentRow } from '@/lib/hrmDepartmentCatalog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: CatalogDepartmentRow | null;
  companyId: string | null;
  rollupTenants?: boolean;
};

export function DepartmentPositionConfigDialog({
  open,
  onOpenChange,
  department,
  companyId,
  rollupTenants = isGroupCeoDepartmentRollupContext(),
}: Props) {
  const [rows, setRows] = useState<HrmDepartmentPositionRecord[]>([]);
  const [master, setMaster] = useState<HrmPayPositionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addCode, setAddCode] = useState('');
  const [localName, setLocalName] = useState('');

  const canConfigure =
    Boolean(companyId) &&
    Boolean(department) &&
    isDepartmentUuid(department?.id ?? '');

  const availableToAdd = useMemo(() => {
    const assigned = new Set(rows.map((r) => r.position_code.toLowerCase()));
    return master.filter(
      (p) =>
        p.status === 'active' &&
        !assigned.has(p.code.toLowerCase()),
    );
  }, [master, rows]);

  const load = useCallback(async () => {
    if (!canConfigure || !companyId || !department) return;
    setLoading(true);
    try {
      const [deptRes, masterRes] = await Promise.all([
        listDepartmentPositions(department.id, { company_id: companyId }),
        listPayPositions({
          company_id: companyId,
          status: 'active',
          rollup_tenants: rollupTenants,
        }),
      ]);
      setRows(deptRes.data ?? []);
      setMaster(masterRes.data ?? []);
    } catch (error) {
      toast.error(toErrorMessage(error, 'Không tải được cấu hình chức danh phòng ban'));
    } finally {
      setLoading(false);
    }
  }, [canConfigure, companyId, department, rollupTenants]);

  useEffect(() => {
    if (open) {
      void load();
    } else {
      setAddCode('');
      setLocalName('');
    }
  }, [open, load]);

  const handleAdd = async () => {
    if (!companyId || !department || !addCode.trim()) return;
    setSaving(true);
    try {
      await upsertDepartmentPosition(department.id, {
        company_id: companyId,
        position_code: addCode.trim(),
        local_name: localName.trim() || null,
        status: 'active',
      });
      toast.success('Đã thêm chức danh cho phòng ban');
      setAddCode('');
      setLocalName('');
      await load();
    } catch (error) {
      toast.error(toErrorMessage(error, 'Không thể thêm chức danh'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (positionCode: string) => {
    if (!companyId || !department) return;
    setSaving(true);
    try {
      await removeDepartmentPosition(department.id, positionCode, companyId);
      toast.success('Đã gỡ chức danh khỏi phòng ban');
      await load();
    } catch (error) {
      toast.error(toErrorMessage(error, 'Không thể gỡ chức danh'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Chức danh — {department?.name ?? 'Phòng ban'}
          </DialogTitle>
        </DialogHeader>

        {!canConfigure ? (
          <p className="text-sm text-muted-foreground">
            Chỉ cấu hình được với phòng ban có bản ghi HRM (UUID). Đồng bộ hoặc tạo phòng ban trước.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-3 space-y-3">
              <p className="text-sm font-medium">Thêm từ danh mục chức danh chung</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Chức danh</Label>
                  <Select value={addCode} onValueChange={setAddCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chức danh" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToAdd.length === 0 ? (
                        <SelectItem value="__empty__" disabled>
                          {loading
                            ? 'Đang tải…'
                            : 'Chưa có chức danh — thêm tại Cài đặt → Danh mục chức danh'}
                        </SelectItem>
                      ) : (
                        availableToAdd.map((p) => (
                          <SelectItem key={p.code} value={p.code}>
                            {p.code} — {p.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Tên hiển thị tại phòng ban (tùy chọn)</Label>
                  <Input
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="Để trống = dùng tên chuẩn"
                  />
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={!addCode || saving}
                onClick={() => void handleAdd()}
              >
                <Plus className="mr-1 h-4 w-4" /> Thêm
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Đã cấu hình</p>
              {loading ? (
                <p className="text-sm text-muted-foreground">Đang tải…</p>
              ) : rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có chức danh nào. Chọn từ danh mục chung và cấu hình tên/ngạch riêng cho phòng ban.
                </p>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{row.effective_name}</span>
                        <Badge variant="outline">{row.position_code}</Badge>
                        <Badge variant="secondary">Ngạch {row.effective_grade_code}</Badge>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={saving}
                      onClick={() => void handleRemove(row.position_code)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
