/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Cài đặt → Chính sách lương (Policy Pack)
 * UC:         UC-BP-PAY-STP-01 (CHUNG) · UC-BP-PAY-STP-03 (KPI) · UC-BP-PAY-STP-04 (BCC_STD)
 * SRS:        docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md
 * TechSpec:   docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md §2.1
 * Purpose:    CRUD chính sách lương CHUNG — bảng danh sách, fullscreen overlay khi tạo/sửa.
 *             Overlay 2 cột: trái = thông tin chung, phải = nhóm chính sách (PolicyGroupEditor).
 * WorkItem:   PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * Coded:      2026-08-22
 * Callers:    Settings.tsx (tab pay-policy-packs)
 * Callees:    usePolicyPackApi · payPolicyPackForm · PolicyGroupEditor
 * must_keep:  testid pay-policy-pack-list · pay-policy-pack-save · pay-policy-pack-scope-chung ·
 *             pay-policy-pack-archive · pay-params-kpi-threshold · pay-params-bcc-std ·
 *             pay-policy-pack-row-{code}; scope CHUNG; payroll_e2e_ready=false; U65 zero-seed
 * NOT scope:  RIÊNG tab / BP filter / geo picker (STP-02/05/06)
 * LastVerified: PolicyPackSetupScreen.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-22 PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-REDESIGN
 * change_mode: UPGRADE
 * What: Thay Sheet/Dialog → custom fullscreen overlay (fixed inset-0 z-50) tránh brand
 *       chrome bloat; 2 cột scroll độc lập; PolicyGroupEditor nhóm chính sách nhiều loại.
 *       groups[] serialize vào rateParams.__groups JSON (FE-only; BE migration sau).
 * Why: Dialog component có brand chrome XeVN không cho fullscreen thực sự.
 * must_keep: testid registry; CHUNG-only; payroll_e2e_ready=false; U65 zero-seed;
 *            stamp PAYPPQC1-MSPXZL1GQC1 và CNTTBEQC1-MSO8HVERQC1 không mở lại
 */
import { useState, useEffect, type FormEvent } from 'react';
import {
  useListPolicyPacks,
  useCreatePolicyPack,
  useUpdatePolicyPack,
  useArchivePolicyPack,
} from './usePolicyPackApi';
import {
  EMPTY_POLICY_PACK_FORM,
  POLICY_PACK_STATUS_LABEL_VI,
  POLICY_PACK_TYPE_LABELS,
  type PolicyPackType,
  buildPolicyPackWritePayload,
  extractChungRateParams,
  statusLabelVi,
  validatePolicyPackForm,
  type PolicyPackFormValues,
} from '@/lib/payPolicyPackForm';
import { usePolicyTypes } from '@/lib/policyTypeConfigStore';
import { PolicyTypeConfigPanel } from './PolicyTypeConfigPanel';
import { formatHrmDateVi } from '@/lib/formatHrmDate';
import { ViDatePickerField } from '@/components/ui/ViDatePickerField';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PolicyGroupEditor } from './PolicyGroupEditor';
import { Settings, Pencil, FileText, Archive, X, ChevronRight, Settings2 } from 'lucide-react';
import { createPortal } from 'react-dom';

// ---------------------------------------------------------------------------
// Helper — Badge trạng thái
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        status === 'active'  ? 'bg-emerald-100 text-emerald-700'
        : status === 'draft' ? 'bg-amber-100 text-amber-700'
        :                      'bg-slate-100 text-slate-500',
      )}
    >
      {statusLabelVi(status)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Fullscreen Overlay — dùng Portal để thoát khỏi stacking context Settings
// ---------------------------------------------------------------------------
interface FullscreenPanelProps {
  isEditing: boolean;
  form: PolicyPackFormValues;
  pending: boolean;
  fieldError: string | null;
  bannerError: string | null;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onArchive: () => void;
  update: (field: keyof PolicyPackFormValues, value: unknown) => void;
  policyTypes: any[];
}

function FullscreenPanel({
  isEditing,
  form,
  pending,
  fieldError,
  bannerError,
  onClose,
  onSubmit,
  onArchive,
  update,
  policyTypes,
}: FullscreenPanelProps) {
  // Khoá scroll body khi panel mở
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Đóng bằng Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const panel = (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-50"
      role="dialog"
      aria-modal="true"
      data-testid="pay-policy-pack-dialog"
    >
      {/* ── Thanh tiêu đề ── */}
      <header className="shrink-0 flex items-center gap-3 px-5 py-3 bg-white border-b shadow-sm">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-slate-500 min-w-0">
          <Settings className="w-4 h-4 shrink-0 text-primary" />
          <span className="hidden sm:block">Cài đặt</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:block text-slate-400">Gói chính sách</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold text-slate-800 truncate max-w-[240px]">
            {isEditing
              ? (form.nameVi || form.code || 'Chính sách')
              : 'Tạo mới chính sách'}
          </span>
        </div>

        {/* Trạng thái */}
        <StatusBadge status={form.status} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-slate-500 hover:text-red-600 hover:border-red-300"
              onClick={onArchive}
              disabled={pending}
              data-testid="pay-policy-pack-archive"
            >
              <Archive className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Ngưng áp dụng</span>
            </Button>
          )}
          <Button
            type="submit"
            form="policy-pack-form"
            disabled={pending}
            data-testid="pay-policy-pack-save"
            className="gap-1.5 min-w-[120px]"
          >
            {pending
              ? 'Đang lưu...'
              : isEditing ? 'Lưu thay đổi' : 'Tạo chính sách'}
          </Button>
          <button
            type="button"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Banner lỗi quyền ── */}
      {bannerError && (
        <div
          role="alert"
          className="shrink-0 mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          {bannerError}
        </div>
      )}

      {/* ── Body 2 cột ── */}
      <form
        id="policy-pack-form"
        onSubmit={onSubmit}
        className="flex-1 flex min-h-0 overflow-hidden"
      >
        {/* ── Cột trái: Thông tin chung ── */}
        <aside className="w-[300px] xl:w-[340px] shrink-0 border-r bg-white overflow-y-auto">
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Thông tin chung
              </h2>

              {/* Field error */}
              {fieldError && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                >
                  {fieldError}
                </div>
              )}

              <div className="space-y-4">
                {/* Mã */}
                <div className="space-y-1.5">
                  <Label htmlFor="pol-code" className="text-xs font-semibold text-slate-600">
                    Mã chính sách <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pol-code"
                    value={form.code}
                    onChange={(e) => update('code', e.target.value)}
                    placeholder="VD: POL_CHUNG_2A"
                    className="h-9"
                    disabled={isEditing}
                  />
                </div>

                {/* Tên */}
                <div className="space-y-1.5">
                  <Label htmlFor="pol-name" className="text-xs font-semibold text-slate-600">
                    Tên chính sách <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pol-name"
                    value={form.nameVi}
                    onChange={(e) => update('nameVi', e.target.value)}
                    placeholder="VD: QĐ 2A/2026 — Thang bảng lương"
                    className="h-9"
                  />
                </div>

                {/* Loại chính sách */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Loại chính sách</Label>
                  <Select
                    value={form.packType}
                    onValueChange={(v) => update('packType', v)}
                    disabled={isEditing}
                  >
                    <SelectTrigger className="h-9 font-medium text-blue-700 bg-blue-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {policyTypes.map(t => (
                        <SelectItem key={t.id} value={t.code}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500">Mẫu lưới dữ liệu (không đổi sau khi tạo).</p>
                </div>

                {/* Hiệu lực từ */}
                <div className="space-y-1.5">
                  <Label htmlFor="pol-from" className="text-xs font-semibold text-slate-600">
                    Hiệu lực từ <span className="text-red-500">*</span>
                  </Label>
                  <ViDatePickerField
                    id="pol-from"
                    value={form.effectiveFrom}
                    onValueChange={(v) => update('effectiveFrom', v)}
                  />
                </div>

                {/* Hiệu lực đến */}
                <div className="space-y-1.5">
                  <Label htmlFor="pol-to" className="text-xs font-semibold text-slate-600">
                    Hiệu lực đến
                  </Label>
                  <ViDatePickerField
                    id="pol-to"
                    value={form.effectiveTo}
                    onValueChange={(v) => update('effectiveTo', v)}
                  />
                  <p className="text-xs text-slate-400">Để trống nếu áp dụng vô thời hạn.</p>
                </div>

                {/* Trạng thái */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Trạng thái</Label>
                  <Select value={form.status} onValueChange={(v) => update('status', v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="active">Đang áp dụng</SelectItem>
                      <SelectItem value="retired">Đã ngưng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* ── Cột phải: Nhóm chính sách ── */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6 bg-slate-50">
          <PolicyGroupEditor
            packType={form.packType}
            groups={form.groups ?? []}
            onChange={(next) => update('groups', next)}
          />
        </main>
      </form>
    </div>
  );

  return createPortal(panel, document.body);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function PolicyPackSetupScreen() {
  const [form, setForm] = useState<PolicyPackFormValues>(EMPTY_POLICY_PACK_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isConfigOpen, setConfigOpen] = useState(false);

  const { types: policyTypes } = usePolicyTypes();
  const [isOpen, setIsOpen] = useState(false);

  const list = useListPolicyPacks('CHUNG');
  const create = useCreatePolicyPack();
  const updatePack = useUpdatePolicyPack();
  const archive = useArchivePolicyPack();

  const startCreate = () => {
    setForm(EMPTY_POLICY_PACK_FORM);
    setEditingId(null);
    setFieldError(null);
    setBannerError(null);
    setIsOpen(true);
  };

  const startEdit = (item: NonNullable<ReturnType<typeof useListPolicyPacks>['data']>[0]) => {
    const rates = extractChungRateParams(item.rateParams as Record<string, unknown> | null);
    setEditingId(item.id);
    setFieldError(null);
    setBannerError(null);
    setForm({
      code: item.code ?? '',
      nameVi: item.nameVi ?? '',
      packType: rates.packType ?? 'salary_scale',
      effectiveFrom: item.effectiveFrom ?? '',
      effectiveTo: item.effectiveTo ?? '',
      status: item.status ?? 'draft',
      groups: rates.groups ?? [],
    });
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setBannerError(null);
    const error = validatePolicyPackForm(form);
    if (error) { setFieldError(error); return; }
    const payload = buildPolicyPackWritePayload(form);
    try {
      if (editingId) {
        await updatePack.mutateAsync({ id: editingId, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lưu thất bại.';
      if (message.includes('Không có quyền')) setBannerError(message);
      else setFieldError(message);
    }
  };

  const handleArchive = async () => {
    if (!editingId) return;
    setFieldError(null);
    setBannerError(null);
    try {
      await archive.mutateAsync(editingId);
      closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ngưng thất bại.';
      if (message.includes('Không có quyền')) setBannerError(message);
      else setFieldError(message);
    }
  };

  const update = (field: keyof PolicyPackFormValues, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const filtered = (list.data ?? []).filter((item) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return item.code.toLowerCase().includes(q) || item.nameVi.toLowerCase().includes(q);
  });

  const pending = create.isPending || updatePack.isPending || archive.isPending;
  const isEditing = editingId !== null;

  return (
    <div data-testid="pay-policy-pack-list" className="space-y-4">

      {/* ── Toolbar ── */}
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        data-testid="pay-policy-pack-scope-chung"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {filtered.length} chính sách
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-9 w-60"
            placeholder="Tìm mã hoặc tên chính sách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Tìm kiếm trong danh sách chính sách"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfigOpen(true)}
            className="gap-1.5"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Loại chính sách</span>
          </Button>
          <Button
            type="button"
            onClick={startCreate}
            data-testid="pay-policy-pack-add"
            className="gap-1.5"
          >
            + Thêm chính sách
          </Button>
        </div>
      </div>

      {/* ── Banner lỗi (ngoài panel) ── */}
      {bannerError && !isOpen && (
        <div
          role="alert"
          className="rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          data-testid="pay-policy-pack-scope-banner"
        >
          {bannerError}
        </div>
      )}

      {/* ── Bảng danh sách ── */}
      <div className="rounded-card border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[160px]">Mã chính sách</TableHead>
              <TableHead className="w-[280px]">Tên chính sách</TableHead>
              <TableHead className="w-[180px]">Loại chính sách</TableHead>
              <TableHead className="w-[80px] text-center">Nhóm</TableHead>
              <TableHead className="w-[130px]">Trạng thái</TableHead>
              <TableHead className="w-[120px]">Hiệu lực từ</TableHead>
              <TableHead className="w-[90px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {list.isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-red-500">
                  Không tải được danh sách.
                </TableCell>
              </TableRow>
            )}
            {!list.isLoading && !list.isError && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  Chưa có chính sách nào. Bấm &quot;+ Thêm chính sách&quot; để tạo mới.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => {
              const rp = item.rateParams as Record<string, unknown> | null;
              const groupCount = Array.isArray(rp?.__groups) ? (rp.__groups as unknown[]).length : 0;
              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => startEdit(item)}
                  data-testid={`pay-policy-pack-row-${item.code}`}
                >
                  <TableCell className="font-medium text-primary">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{item.code}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm truncate max-w-[260px]">{item.nameVi}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {rp?.packType ? policyTypes.find(t => t.code === rp.packType)?.name || rp.packType : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {groupCount > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {groupCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status ?? ''} />
                  </TableCell>
                  <TableCell className="text-sm">{formatHrmDateVi(item.effectiveFrom)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-primary hover:text-primary/80 hover:bg-primary/10"
                      onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Fullscreen overlay ── */}
      {isOpen && (
        <FullscreenPanel
          isEditing={isEditing}
          form={form}
          pending={pending}
          fieldError={fieldError}
          bannerError={bannerError}
          onClose={closePanel}
          onSubmit={handleSubmit}
          onArchive={handleArchive}
          update={update}
          policyTypes={policyTypes}
        />
      )}

      {isConfigOpen && (
        <PolicyTypeConfigPanel onClose={() => setConfigOpen(false)} />
      )}
    </div>
  );
}
