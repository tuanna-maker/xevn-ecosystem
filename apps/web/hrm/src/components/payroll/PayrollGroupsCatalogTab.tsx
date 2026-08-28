/**
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01
 * change_mode: ADD
 * What: Tenant payroll group catalog CRUD + members preview (F-PAY-GROUP-01)
 * Why: J-HRM-PAY-09-01/02 · AC-PAY-GROUP-CATALOG-SOT · U65 FE-after-2xx+F5
 * must_keep: PAY01..08 QC seals · payroll_e2e_ready=false · ≠ PAY-09 module DONE · no hardcode VP/KD/TX/VH
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01
 * change_mode: FIX
 * What: POST 201 upsert + refetch payroll-groups cache (FE-PAY09-CATALOG-LIST-STALE)
 * Why: QA refetch() sau Lưu chưa đủ — row testid phải hiện ngay sau 2xx
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MoreHorizontal, Pencil, Plus, Search, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listPayrollPeriods } from '@/integrations/hrmApi';
import {
  usePayrollGroupMembersPreview,
  usePayrollGroupMutations,
  usePayrollGroups,
} from '@/hooks/usePayrollGroups';
import {
  PAY09_GROUP_HONESTY_FOOTER,
  PAY09_PEER_STAMP_PAY08,
  assertNoHardcodedPayrollGroupSeed,
  buildMatchRuleFromForm,
  formatPayrollGroupMatchSourceLabelVi,
  formatPayrollGroupStatusLabelVi,
  joinCommaSeparatedIds,
} from '@/lib/payPay09GroupRing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HrmListLoadBanner } from '@/components/hrm/HrmListLoadBanner';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { toast } from 'sonner';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { jobTitleOptionsFromCatalog } from '@/lib/catalogSearchPicker';
import { useEmployees } from '@/hooks/useEmployees';
import { MultiCatalogSearchPicker } from '@/components/common/MultiCatalogSearchPicker';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';

type GroupFormState = {
  code: string;
  name_vi: string;
  priority: string;
  departmentIds: string[];
  positionKeys: string[];
  employeeIds: string[];
  status: 'active' | 'retired';
};

const emptyForm = (): GroupFormState => ({
  code: '',
  name_vi: '',
  priority: '0',
  departmentIds: [],
  positionKeys: [],
  employeeIds: [],
  status: 'active',
});

export function PayrollGroupsCatalogTab() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const companyId = currentCompanyId ? coerceHrmListCompanyId(currentCompanyId) : '';
  const { groups, isLoading, fetchError, refetch, useApiMode } = usePayrollGroups();
  const { createGroup, updateGroup, isCreating, isUpdating } = usePayrollGroupMutations();

  const { catalogs, departmentPickerOptions, isDepartmentLoading } = useSettingsCatalogsOverview();
  const positionPickerOptions = useMemo(() => jobTitleOptionsFromCatalog(catalogs ?? []), [catalogs]);
  
  const employeesQuery = useEmployees(false, companyId);
  const employeePickerOptions = useMemo(() => {
    return (employeesQuery.data?.rows ?? []).map(emp => ({
      value: emp.id,
      label: emp.full_name,
      code: emp.employee_code,
    }));
  }, [employeesQuery.data?.rows]);

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GroupFormState>(emptyForm());

  const [membersGroupId, setMembersGroupId] = useState<string | null>(null);
  const [periodOptions, setPeriodOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [periodsLoading, setPeriodsLoading] = useState(false);
  const membersPreview = usePayrollGroupMembersPreview(membersGroupId);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) => g.code.toLowerCase().includes(q) || g.name_vi.toLowerCase().includes(q),
    );
  }, [groups, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const row = groups.find((g) => g.id === id);
    if (!row) return;
    setEditingId(id);
    setForm({
      code: row.code,
      name_vi: row.name_vi,
      priority: String(row.priority ?? 0),
      departmentIds: row.match_rule_json?.department_ids ?? [],
      positionKeys: row.match_rule_json?.position_keys ?? [],
      employeeIds: row.match_rule_json?.employee_ids ?? [],
      status: row.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!companyId) return;
    const code = form.code.trim();
    const nameVi = form.name_vi.trim();
    if (!code || !nameVi) {
      toast.error(t('common.fillAllFields', 'Vui lòng điền đủ thông tin'));
      return;
    }
    if (!assertNoHardcodedPayrollGroupSeed([code])) {
      toast.error('Mã nhóm không được dùng bộ mã cố định (VP/KD/TX/VH hoặc office/sales/driver/ops).');
      return;
    }
    const priority = Number.parseInt(form.priority, 10);
    const match_rule_json = buildMatchRuleFromForm({
      departmentIdsText: form.departmentIds.join(','),
      positionKeysText: form.positionKeys.join(','),
      employeeIdsText: form.employeeIds.join(','),
    });

    if (editingId) {
      await updateGroup({
        groupId: editingId,
        payload: {
          name_vi: nameVi,
          priority: Number.isFinite(priority) ? priority : 0,
          match_rule_json,
          status: form.status,
        },
      });
    } else {
      await createGroup({
        company_id: companyId,
        code,
        name_vi: nameVi,
        priority: Number.isFinite(priority) ? priority : 0,
        match_rule_json,
        status: 'active',
      });
    }
    setDialogOpen(false);
    // Mutation hook upserts cache + refetchQueries; belt-and-suspenders for catalog tab instance.
    await refetch();
  };

  const openMembers = async (groupId: string) => {
    setMembersGroupId(groupId);
    membersPreview.clearPreview();
    if (!companyId) return;
    setPeriodsLoading(true);
    try {
      const res = await listPayrollPeriods({ company_id: companyId });
      setPeriodOptions(
        (res.data ?? []).map((p) => ({ id: p.id, label: p.period_label })),
      );
    } catch {
      setPeriodOptions([]);
      toast.error('Không tải được danh sách kỳ lương');
    } finally {
      setPeriodsLoading(false);
    }
  };

  if (!useApiMode) {
    return (
      <div className="p-6 xevn-safe-inline" data-testid="pay-groups-catalog-precision">
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Chế độ API HRM chưa bật — mở Lương từ Command Center (portal).
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 xevn-safe-inline" data-testid="pay-groups-catalog-precision">
      {fetchError ? (
        <div className="space-y-2">
          <HrmListLoadBanner loadFailed errorMessage={fetchError} />
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            {t('common.retry', 'Thử lại')}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold font-display text-xevn-text">
            Phân nhóm bảng lương
          </h2>
          <p className="text-sm text-muted-foreground">
            Danh mục tenant — không hardcode bốn nhóm cố định · peer PAY-08 {PAY09_PEER_STAMP_PAY08}
          </p>
        </div>
        <Button onClick={openCreate} data-testid="pay-group-create-btn">
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhóm
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search', 'Tìm kiếm mã / tên')}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên (vi)</TableHead>
                <TableHead className="text-right">Ưu tiên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Chưa có nhóm — tạo từ FE (POST 2xx) rồi F5 để xác nhận.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id} data-testid={`pay-group-row-${row.id}`}>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.name_vi}</TableCell>
                    <TableCell className="text-right">{row.priority}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                        {formatPayrollGroupStatusLabelVi(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Thao tác">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(row.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Sửa / ngừng dùng
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => void openMembers(row.id)}>
                            <Users className="h-4 w-4 mr-2" />
                            Xem thành viên (preview)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {membersGroupId ? (
        <Card data-testid="pay-group-members-preview">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium">Preview thành viên theo kỳ</h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <Label>Kỳ lương</Label>
                <CatalogSearchPicker
                  options={periodOptions.map(p => ({ value: p.id, label: p.label }))}
                  value={membersPreview.periodId}
                  onValueChange={(v) => membersPreview.setPeriodId(v)}
                  disabled={periodsLoading}
                  placeholder={periodsLoading ? 'Đang tải kỳ…' : 'Chọn kỳ'}
                  searchPlaceholder="Tìm kiếm kỳ lương..."
                />
              </div>
              <Button
                type="button"
                onClick={() => void membersPreview.loadPreview()}
                disabled={membersPreview.isLoading || !membersPreview.periodId}
                data-testid="pay-group-members-load"
              >
                {membersPreview.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tải preview'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setMembersGroupId(null)}>
                Đóng
              </Button>
            </div>
            {membersPreview.error ? (
              <p className="text-sm text-destructive">{membersPreview.error}</p>
            ) : null}
            {membersPreview.preview ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã NV</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Nguồn khớp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(membersPreview.preview.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Không có NV khớp rule trong kỳ này.
                      </TableCell>
                    </TableRow>
                  ) : (
                    membersPreview.preview.items.map((item) => (
                      <TableRow key={item.employee_id}>
                        <TableCell>{item.employee_code}</TableCell>
                        <TableCell>
                          {item.employee_name}
                          {item.conflict ? (
                            <Badge variant="destructive" className="ml-2">
                              Xung đột
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell>{formatPayrollGroupMatchSourceLabelVi(item.match_source)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <p className="text-xs text-muted-foreground" data-testid="pay09-catalog-honesty-footer">
        {PAY09_GROUP_HONESTY_FOOTER}
      </p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa nhóm bảng lương' : 'Thêm nhóm bảng lương'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Mã nhóm</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                disabled={Boolean(editingId)}
                placeholder="VD: NHOM-VAN-PHONG"
                data-testid="pay-group-form-code"
              />
            </div>
            <div>
              <Label>Tên hiển thị (tiếng Việt)</Label>
              <Input
                value={form.name_vi}
                onChange={(e) => setForm((f) => ({ ...f, name_vi: e.target.value }))}
                data-testid="pay-group-form-name"
              />
            </div>
            <div>
              <Label>Ưu tiên (số nguyên)</Label>
              <Input
                type="number"
                min={0}
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              />
            </div>
            {editingId ? (
              <div>
                <Label>Trạng thái</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as 'active' | 'retired' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang dùng</SelectItem>
                    <SelectItem value="retired">Ngừng sử dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div>
              <Label>Phòng ban</Label>
              <MultiCatalogSearchPicker
                options={departmentPickerOptions}
                values={form.departmentIds}
                onValuesChange={(v) => setForm(f => ({ ...f, departmentIds: v }))}
                placeholder="Chọn phòng ban..."
                loading={isDepartmentLoading}
              />
            </div>
            <div>
              <Label>Chức danh</Label>
              <MultiCatalogSearchPicker
                options={positionPickerOptions}
                values={form.positionKeys}
                onValuesChange={(v) => setForm(f => ({ ...f, positionKeys: v }))}
                placeholder="Chọn chức danh..."
              />
            </div>
            <div>
              <Label>Danh sách NV đặc thù</Label>
              <MultiCatalogSearchPicker
                options={employeePickerOptions}
                values={form.employeeIds}
                onValuesChange={(v) => setForm(f => ({ ...f, employeeIds: v }))}
                placeholder="Chọn nhân viên..."
                loading={employeesQuery.isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={isCreating || isUpdating}
              data-testid="pay-group-form-submit"
            >
              {isCreating || isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
