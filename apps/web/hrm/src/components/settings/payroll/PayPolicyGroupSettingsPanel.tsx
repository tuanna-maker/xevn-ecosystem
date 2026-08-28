/**
 * @CODE-MEMORY
 * Screen:     Settings → Lương → Nhóm Chính sách (F-PAY-POLICY-GROUP-01)
 * UC:         UC-G0-01 (List), UC-G0-02 (Create), UC-G0-03 (Update), UC-G0-04 (SoftDelete)
 * SRS:        SRS_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md
 * TechSpec:   TECHSPEC_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md §5 (UIUX Spec)
 * Purpose:    FE Settings panel — Quản lý Nhóm Chính sách lương.
 *             Layout: Breadcrumb + Grid card 3 cột + Right Drawer 480px.
 *             Platform cards: badge "Hệ thống", disabled Edit/Delete.
 *             Tenant cards: Edit + Delete mềm + confirm dialog.
 * WorkItem:   G0-FOUNDATION-PAY-POLICY-GROUPS-FE-01
 * Coded:      2026-08-27
 * must_keep:  BR-G0-07 platform readonly; BR-G0-12 soft-delete only; real-time code check debounce 300ms
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  checkPayPolicyGroupCode,
  createPayPolicyGroup,
  deletePayPolicyGroup,
  listPayPolicyGroups,
  updatePayPolicyGroup,
  type PayPolicyGroupRecord,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';

// ─── Constants ────────────────────────────────────────────────────────────────
const ICON_PRESETS = ['💰','🏆','🎁','⚠️','🏥','📊','🎯','💡','🔑','⭐','🏦','📋','🔧','💼','🌟','🎪','💎','🚀','🎓','🏅'];
const COLOR_PRESETS = [
  { hex: '#10B981', label: 'Xanh lá' },
  { hex: '#F59E0B', label: 'Vàng cam' },
  { hex: '#3B82F6', label: 'Xanh dương' },
  { hex: '#EF4444', label: 'Đỏ' },
  { hex: '#8B5CF6', label: 'Tím' },
  { hex: '#6B7280', label: 'Xám' },
  { hex: '#EC4899', label: 'Hồng' },
  { hex: '#14B8A6', label: 'Xanh ngọc' },
  { hex: '#F97316', label: 'Cam' },
  { hex: '#06B6D4', label: 'Xanh lam' },
  { hex: '#84CC16', label: 'Xanh nhạt' },
  { hex: '#A855F7', label: 'Tím nhạt' },
];

type FormState = {
  code: string;
  name_vi: string;
  icon: string;
  color_hex: string;
  sort_order: string;
  description: string;
};
const EMPTY_FORM: FormState = { code: '', name_vi: '', icon: '💰', color_hex: '#10B981', sort_order: '', description: '' };

// ─── Main Panel ───────────────────────────────────────────────────────────────
export function PayPolicyGroupSettingsPanel() {
  const [groups, setGroups] = useState<PayPolicyGroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<PayPolicyGroupRecord | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Code check
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [codeMsg, setCodeMsg] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Confirm delete dialog
  const [deleteTarget, setDeleteTarget] = useState<PayPolicyGroupRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPayPolicyGroups();
      // @ts-ignore - res could be the array directly or wrapped in { data } depending on requestHrm
      const data = Array.isArray(res) ? res : res?.data;
      setGroups(data ?? []);
    } catch (err) {
      toast.error(toErrorMessage(err, 'Không thể tải danh sách nhóm'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // ─── Filter ────────────────────────────────────────────────────────────────
  const filtered = groups.filter((g) =>
    !searchQ || g.name_vi.toLowerCase().includes(searchQ.toLowerCase()) || g.code.toLowerCase().includes(searchQ.toLowerCase()),
  );

  // ─── Open drawer ───────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setCodeStatus('idle');
    setCodeMsg('');
    setDrawerOpen(true);
  };

  const openEdit = (item: PayPolicyGroupRecord) => {
    setEditItem(item);
    setForm({
      code: item.code,
      name_vi: item.name_vi,
      icon: item.icon ?? '💰',
      color_hex: item.color_hex ?? '#10B981',
      sort_order: String(item.sort_order),
      description: item.description ?? '',
    });
    setCodeStatus('ok');
    setCodeMsg('');
    setDrawerOpen(true);
  };

  // ─── Code debounce check (UC-G0-02 real-time) ──────────────────────────────
  const handleCodeChange = (val: string) => {
    const upper = val.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    setForm((f) => ({ ...f, code: upper }));
    if (editItem) return; // code immutable on edit
    clearTimeout(debounceRef.current);
    if (!upper || upper.length < 2) { setCodeStatus('idle'); setCodeMsg(''); return; }
    setCodeStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkPayPolicyGroupCode(upper);
        setCodeStatus(res.available ? 'ok' : 'error');
        setCodeMsg(res.available ? '' : (res.reason ?? 'Mã đã tồn tại'));
      } catch {
        setCodeStatus('idle');
      }
    }, 300);
  };

  // ─── Save (create / update) ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name_vi.trim()) { toast.error('Tên nhóm không được để trống'); return; }
    if (!editItem && (!form.code || form.code.length < 2)) { toast.error('Mã nhóm tối thiểu 2 ký tự'); return; }
    if (!editItem && codeStatus === 'error') { toast.error(codeMsg || 'Mã nhóm không hợp lệ'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await updatePayPolicyGroup(editItem.id, {
          name_vi: form.name_vi.trim(),
          icon: form.icon,
          color_hex: form.color_hex,
          sort_order: form.sort_order ? Number(form.sort_order) : undefined,
          description: form.description.trim() || undefined,
        });
        toast.success('Cập nhật nhóm thành công');
      } else {
        await createPayPolicyGroup({
          code: form.code,
          name_vi: form.name_vi.trim(),
          icon: form.icon,
          color_hex: form.color_hex,
          sort_order: form.sort_order ? Number(form.sort_order) : undefined,
          description: form.description.trim() || undefined,
        });
        toast.success('Tạo nhóm thành công');
      }
      setDrawerOpen(false);
      fetchGroups();
    } catch (err) {
      const msg = toErrorMessage(err, 'Có lỗi xảy ra');
      toast.error(msg.includes('CODE-DUPLICATE') || msg.includes('đã tồn tại') ? 'Mã nhóm đã tồn tại' : msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete (soft) ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePayPolicyGroup(deleteTarget.id);
      toast.success('Xóa nhóm thành công');
      setDeleteTarget(null);
      fetchGroups();
    } catch (err) {
      toast.error(toErrorMessage(err, 'Không thể xóa nhóm'));
    } finally {
      setDeleting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4" data-testid="pay-policy-group-panel">

      {/* Header toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            data-testid="pay-policy-group-search"
            placeholder="Tìm theo tên hoặc mã nhóm..."
            className="pl-9"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <Button
          data-testid="pay-policy-group-add-btn"
          onClick={openCreate}
          size="sm"
          className="shrink-0"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm nhóm
        </Button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground" data-testid="pay-policy-group-empty">
          {searchQ ? (
            <>
              <Search className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">Không tìm thấy nhóm nào</p>
              <Button variant="ghost" size="sm" onClick={() => setSearchQ('')}>Xóa bộ lọc</Button>
            </>
          ) : (
            <>
              <span className="text-5xl">📂</span>
              <p className="text-sm font-medium">Chưa có nhóm nào</p>
              <p className="text-xs">Bấm <strong>+ Thêm nhóm</strong> để bắt đầu</p>
            </>
          )}
        </div>
      )}

      {/* Grid cards 3 cột */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <PolicyGroupCard
              key={g.id}
              group={g}
              onEdit={() => openEdit(g)}
              onDelete={() => setDeleteTarget(g)}
            />
          ))}
        </div>
      )}

      {/* Right Drawer — Thêm/Sửa nhóm (480px) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full max-w-[480px] overflow-y-auto" data-testid="pay-policy-group-drawer">
          <SheetHeader>
            <SheetTitle>{editItem ? 'Sửa nhóm chính sách' : '+ Thêm nhóm chính sách'}</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-5 py-5">
            {/* Code (immutable on edit) */}
            <div className="space-y-1.5">
              <Label htmlFor="ppg-code">
                <span className="text-red-500 mr-0.5">*</span>Mã nhóm
              </Label>
              <Input
                id="ppg-code"
                data-testid="ppg-input-code"
                placeholder="VD: LUONG_KHOAN"
                value={form.code}
                readOnly={!!editItem}
                disabled={!!editItem}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={codeStatus === 'error' ? 'border-red-500' : codeStatus === 'ok' ? 'border-green-500' : ''}
              />
              {codeStatus === 'checking' && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Đang kiểm tra...</p>}
              {codeStatus === 'error' && <p className="text-xs text-red-600" data-testid="ppg-code-error">{codeMsg}</p>}
              {codeStatus === 'ok' && !editItem && <p className="text-xs text-green-600">✓ Mã có thể sử dụng</p>}
              {editItem && <p className="text-xs text-muted-foreground">Mã nhóm không thể thay đổi sau khi tạo</p>}
            </div>

            {/* Tên nhóm */}
            <div className="space-y-1.5">
              <Label htmlFor="ppg-name">
                <span className="text-red-500 mr-0.5">*</span>Tên nhóm
              </Label>
              <Input
                id="ppg-name"
                data-testid="ppg-input-name"
                placeholder="VD: Phụ cấp đặc thù"
                value={form.name_vi}
                onChange={(e) => setForm((f) => ({ ...f, name_vi: e.target.value }))}
              />
            </div>

            {/* Icon picker */}
            <div className="space-y-1.5">
              <Label>Icon nhóm</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_PRESETS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                    className={`h-9 w-9 text-xl rounded-lg border-2 flex items-center justify-center transition-all ${form.icon === ic ? 'border-blue-500 bg-blue-50 scale-110' : 'border-slate-200 hover:border-slate-400'}`}
                    title={ic}
                    data-testid={`ppg-icon-${ic}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker (12 preset) */}
            <div className="space-y-1.5">
              <Label>Màu nền</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color_hex: c.hex }))}
                    style={{ backgroundColor: c.hex }}
                    className={`h-8 w-8 rounded-full border-4 transition-all ${form.color_hex === c.hex ? 'border-slate-800 scale-110' : 'border-transparent hover:border-slate-400'}`}
                    title={c.label}
                    data-testid={`ppg-color-${c.hex.replace('#','')}`}
                  />
                ))}
              </div>
              {/* Preview */}
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-white" style={{ backgroundColor: form.color_hex }}>
                  {form.icon}
                </span>
                <span className="font-medium">{form.name_vi || 'Tên nhóm'}</span>
              </div>
            </div>

            {/* Sort order */}
            <div className="space-y-1.5">
              <Label htmlFor="ppg-sort">Thứ tự hiển thị</Label>
              <Input
                id="ppg-sort"
                data-testid="ppg-input-sort"
                type="number"
                min="1"
                placeholder="Để trống = cuối danh sách"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="ppg-desc">Ghi chú</Label>
              <Textarea
                id="ppg-desc"
                data-testid="ppg-input-desc"
                placeholder="Mô tả nhóm (tuỳ chọn)"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          <SheetFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving} data-testid="ppg-btn-cancel">
              <X className="mr-1.5 h-4 w-4" />Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || (!editItem && codeStatus === 'error') || (!editItem && codeStatus === 'checking')}
              data-testid="ppg-btn-save"
            >
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Lưu
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Confirm delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent data-testid="ppg-delete-dialog">
          <DialogHeader>
            <DialogTitle>Xóa nhóm chính sách</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Xóa nhóm <strong className="text-foreground">"{deleteTarget?.name_vi}"</strong>?
            {(deleteTarget?.active_policy_count ?? 0) > 0 && (
              <span className="block mt-1 text-amber-700">
                ⚠️ {deleteTarget?.active_policy_count} chính sách trong nhóm này sẽ chuyển về "Chưa phân nhóm".
              </span>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting} data-testid="ppg-delete-confirm">
              {deleting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
              Xóa nhóm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── PolicyGroupCard component ────────────────────────────────────────────────
type CardProps = {
  group: PayPolicyGroupRecord;
  onEdit: () => void;
  onDelete: () => void;
};

function PolicyGroupCard({ group, onEdit, onDelete }: CardProps) {
  const bgColor = group.color_hex ?? '#6B7280';

  return (
    <div
      className="relative rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      data-testid={`ppg-card-${group.code}`}
    >
      {/* Color bar top */}
      <div className="h-1.5 w-full" style={{ backgroundColor: bgColor }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Header row: icon + badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg text-xl text-white shrink-0"
              style={{ backgroundColor: bgColor }}
            >
              {group.icon ?? '📋'}
            </span>
            <div>
              <p className="font-semibold text-sm leading-tight">{group.name_vi}</p>
              <p className="text-xs text-muted-foreground font-mono">{group.code}</p>
            </div>
          </div>
          {/* Platform badge */}
          {group.is_platform && (
            <span className="shrink-0 inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 border border-violet-200" title="Nhóm hệ thống không thể xóa">
              Hệ thống
            </span>
          )}
        </div>

        {/* Policy count */}
        <p className="text-xs text-muted-foreground">
          {group.active_policy_count > 0
            ? <span><strong className="text-foreground">{group.active_policy_count}</strong> chính sách active</span>
            : 'Chưa có chính sách'}
        </p>

        {/* Actions (tenant only) */}
        {!group.is_platform && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs gap-1"
              onClick={onEdit}
              data-testid={`ppg-card-edit-${group.code}`}
            >
              <Pencil className="h-3 w-3" />Sửa
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onDelete}
              data-testid={`ppg-card-delete-${group.code}`}
            >
              <Trash2 className="h-3 w-3" />Xóa
            </Button>
          </div>
        )}
        {/* Platform: tooltip info instead of action buttons */}
        {group.is_platform && (
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-muted-foreground italic">Nhóm hệ thống — không thể sửa/xóa</p>
          </div>
        )}
      </div>
    </div>
  );
}