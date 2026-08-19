/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Gói chính sách CHUNG (STP-POLICY-PACK)
 * UC:         UC-BP-PAY-STP-01 (CHUNG) · UC-BP-PAY-STP-03 (KPI) · UC-BP-PAY-STP-04 (BCC_STD)
 * SRS:        docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md
 *             — AC-PAY-STP-01-01..05 · AC-PAY-STP-03-01 · AC-PAY-STP-04-01 · GLOBAL-01
 * TechSpec:   docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md §2.1
 * UI:         docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md §3 IA two-pane · §4.1–4.3
 * API:        usePolicyPackApi → /api/hrm/payroll/pay-policy-packs* (company_id snake)
 * Purpose:    CRUD gói chính sách lương CHUNG — danh sách trái, form phải (tạo mặc định,
 *             sửa khi chọn dòng); bind API LIVE; ngày dd/MM/yyyy (ViDateField); BCC_STD nhóm
 *             nghìn vi-VN (ViMoneyInput); KPI score 0–100 không nhóm nghìn; không eval formula.
 * WorkItem:   PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * Coded:      2026-08-12
 * Callers:    payroll/setup/PayrollSetupHub.tsx (mục «Gói chính sách»)
 * Callees:    usePolicyPackApi (list/create/update/archive) · payPolicyPackForm (validate/build)
 * must_keep:  testid pay-policy-pack-list · pay-policy-pack-save · pay-policy-pack-scope-chung ·
 *             pay-policy-pack-archive · pay-params-kpi-threshold · pay-params-bcc-std ·
 *             pay-policy-pack-row-{code}; form tạo hiển thị mặc định khi chưa chọn dòng;
 *             scope luôn CHUNG — cấm gộp CHUNG+RIÊNG 1 form; payroll_e2e_ready=false; U65
 * NOT scope:  RIÊNG tab / BP filter / geo picker / VP allowance (STP-02/05/06) — residual
 * LastVerified: PolicyPackSetupScreen.test.ts (8 case) · payPolicyPackForm.test.ts (7 case)
 *
 * @CODE-MEMORY-CHANGE 2026-08-12 PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * change_mode: ADD
 * What: Two-pane IA; ViDateField; rate params KPI+BCC_STD; archive POST; 403 banner;
 *       helpers payPolicyPackForm; bỏ JSON textarea thô cho CHUNG.
 * Why: Exit criteria POLICY-PACK-01 — locale vi-VN + AC archive/KPI/BCC.
 * must_keep: Hub route wire PASS; không đụng apps/api/**; formula HOLD
 *
 * @CODE-MEMORY-CHANGE 2026-08-12 D-PAY-CNTT-FE-POLICY-PACK-RESTORE-01
 * change_mode: FIX (restore sau peer overwrite)
 * What: Khôi phục hành vi bản POLICY-PACK-01 sau khi Claude CLI ghi đè dở dang file này:
 *       (1) pane phải luôn có form — mặc định form TẠO, đổi sang form SỬA khi chọn dòng
 *           (bản đè chỉ render form khi editingId → nút «+ Thêm gói» ra empty state);
 *       (2) trả lại data-testid pay-params-bcc-std trên ViMoneyInput (AC-PAY-STP-04-01);
 *       (3) testid dòng theo mã gói `pay-policy-pack-row-{code}`;
 *       (4) empty copy «Chưa có gói — tạo từ nút Thêm gói.»;
 *       (5) đúng contract primitive: ViMoneyInput/ViDateField dùng onValueChange (bản đè dùng
 *           onChange + prop allowEmpty không tồn tại), statusLabelVi là hàm, kpiThreshold là string.
 * Why: Bản đè làm FAIL AC-PAY-STP-01-01 (không tạo được gói) + AC-PAY-STP-04-01 (thiếu testid).
 * must_keep: AC bản Cursor READY_FOR_QA; scope CHUNG-only; payroll_e2e_ready=false; U65 zero-seed;
 *            hub route /hr/payroll/setup; không mở RIÊNG/STP-02/05/06
 *
 * @CODE-MEMORY-CHANGE 2026-08-12 D-PAY-STP-SEARCH-ARIA-P2-01
 * change_mode: FIX (a11y hẹp — chỉ nhãn trợ năng ô tìm kiếm)
 * What: Đổi aria-label ô tìm kiếm danh sách gói từ «Tìm mã hoặc tên gói» →
 *       «Tìm kiếm trong danh sách gói».
 * Why: DEF-PAY-STP-SEARCH-ARIA-P2 (QC GWC PAYPPQC1-MSPXZL1GQC1): nhãn cũ chứa cụm
 *       «tên gói» nên khớp substring với Label form «Tên gói (VI)» → harness
 *       Playwright/Testing Library gõ nhầm vào ô tìm kiếm; trình đọc màn hình cũng
 *       dễ nhầm hai điều khiển. Nhãn mới không chứa cụm «Tên gói» / «Mã gói».
 * must_keep: Label form «Tên gói (VI)» + «Mã gói» giữ nguyên; không đụng luồng lưu/
 *            cập nhật/ngưng áp dụng, testid registry, honesty banner; CHUNG-only;
 *            payroll_e2e_ready=false; U65 zero-seed; stamp PAYPPQC1-MSPXZL1GQC1 và
 *            CNTTBEQC1-MSO8HVERQC1 không mở lại
 */
import { useState, type FormEvent } from 'react';
import {
  useListPolicyPacks,
  useCreatePolicyPack,
  useUpdatePolicyPack,
  useArchivePolicyPack,
  type PolicyPack,
} from './usePolicyPackApi';
import {
  EMPTY_POLICY_PACK_FORM,
  MSG_KPI_RANGE,
  POLICY_PACK_STATUS_LABEL_VI,
  buildPolicyPackWritePayload,
  extractChungRateParams,
  statusLabelVi,
  validatePolicyPackForm,
  type PolicyPackFormStatus,
  type PolicyPackFormValues,
} from '@/lib/payPolicyPackForm';
import { formatHrmDateVi } from '@/lib/formatHrmDate';
import { ViDateField } from '@/components/ui/ViDateField';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function PolicyPackSetupScreen() {
  const [form, setForm] = useState<PolicyPackFormValues>(EMPTY_POLICY_PACK_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const list = useListPolicyPacks('CHUNG');
  const create = useCreatePolicyPack();
  const updatePack = useUpdatePolicyPack();
  const archive = useArchivePolicyPack();

  /** Về form tạo mới (cũng là trạng thái mặc định của pane phải). */
  const startCreate = () => {
    setForm(EMPTY_POLICY_PACK_FORM);
    setEditingId(null);
    setFieldError(null);
    setBannerError(null);
  };

  const startEdit = (item: PolicyPack) => {
    const rates = extractChungRateParams(item.rateParams);
    setEditingId(item.id);
    setFieldError(null);
    setBannerError(null);
    setForm({
      code: item.code ?? '',
      nameVi: item.nameVi ?? '',
      effectiveFrom: item.effectiveFrom ?? '',
      effectiveTo: item.effectiveTo ?? '',
      status: (item.status as PolicyPackFormStatus) ?? 'draft',
      kpiThreshold: rates.kpiThreshold,
      bccStd: rates.bccStd,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldError(null);
    setBannerError(null);

    const error = validatePolicyPackForm(form);
    if (error) {
      setFieldError(error);
      return;
    }

    const payload = buildPolicyPackWritePayload(form);

    try {
      if (editingId) {
        await updatePack.mutateAsync({ id: editingId, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      startCreate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lưu thất bại.';
      // 403 scope → banner giữ nguyên form để C&B sửa/nhờ cấp quyền (BR-PAY-STP-01).
      if (message.includes('Không có quyền')) {
        setBannerError(message);
      } else {
        setFieldError(message);
      }
    }
  };

  const handleArchive = async () => {
    if (!editingId) return;
    setFieldError(null);
    setBannerError(null);
    try {
      await archive.mutateAsync(editingId);
      startCreate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ngưng thất bại.';
      if (message.includes('Không có quyền')) {
        setBannerError(message);
      } else {
        setFieldError(message);
      }
    }
  };

  const update = <K extends keyof PolicyPackFormValues>(field: K, value: PolicyPackFormValues[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const filtered = (list.data ?? []).filter((item) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return item.code.toLowerCase().includes(q) || item.nameVi.toLowerCase().includes(q);
  });

  const pending = create.isPending || updatePack.isPending || archive.isPending;
  const kpiInvalid = fieldError === MSG_KPI_RANGE;
  const isEditing = editingId !== null;

  return (
    <div data-testid="pay-policy-pack-list" className="space-y-4">
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        data-testid="pay-policy-pack-scope-chung"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
            Chương trình chung
          </span>
          <span className="text-sm text-muted-foreground">{filtered.length} gói</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-10 w-48"
            placeholder="Tìm mã/tên…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Tìm kiếm trong danh sách gói"
          />
          <Button type="button" onClick={startCreate} data-testid="pay-policy-pack-add">
            + Thêm gói
          </Button>
        </div>
      </div>

      {bannerError && (
        <div
          role="alert"
          className="rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          data-testid="pay-policy-pack-scope-banner"
        >
          {bannerError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Danh sách 1/4 */}
        <div className="space-y-2 md:col-span-3">
          {list.isLoading && <p className="text-sm text-muted-foreground">Đang tải danh sách…</p>}
          {list.isError && <p className="text-sm text-red-600">Không tải được danh sách.</p>}
          {!list.isLoading && !list.isError && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có gói — tạo từ nút Thêm gói.</p>
          )}
          <ul className="space-y-1">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    'w-full rounded-input border px-3 py-2 text-left text-sm',
                    editingId === item.id && 'border-primary bg-muted',
                  )}
                  onClick={() => startEdit(item)}
                  data-testid={`pay-policy-pack-row-${item.code}`}
                >
                  <div className="font-medium">{item.code}</div>
                  <div className="text-xs text-muted-foreground">{item.nameVi}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {statusLabelVi(item.status)} · từ {formatHrmDateVi(item.effectiveFrom)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Chi tiết 3/4 — luôn có form: tạo mới mặc định, sửa khi chọn dòng */}
        <div className="md:col-span-9">
          <form onSubmit={handleSubmit} className="space-y-3 rounded-card border p-4">
            <h3 className="font-medium">
              {isEditing ? 'Cập nhật gói chính sách CHUNG' : 'Tạo gói chính sách CHUNG'}
            </h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="code">Mã gói</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => update('code', e.target.value)}
                  placeholder="VD: POL_CHUNG_2A"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nameVi">Tên gói (VI)</Label>
                <Input
                  id="nameVi"
                  value={form.nameVi}
                  onChange={(e) => update('nameVi', e.target.value)}
                  placeholder="VD: Thang bậc QĐ 2A"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="effectiveFrom">Hiệu lực từ</Label>
                <ViDateField
                  id="effectiveFrom"
                  value={form.effectiveFrom}
                  onValueChange={(value) => update('effectiveFrom', value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="effectiveTo">Hiệu lực đến</Label>
                <ViDateField
                  id="effectiveTo"
                  value={form.effectiveTo}
                  onValueChange={(value) => update('effectiveTo', value)}
                />
                <p className="text-xs text-muted-foreground">Để trống nếu áp dụng vô thời hạn.</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  className="h-10 w-full rounded-input border border-input bg-background px-2 text-sm"
                  value={form.status}
                  onChange={(e) => update('status', e.target.value as PolicyPackFormStatus)}
                >
                  {(['draft', 'active', 'retired'] as const).map((s) => (
                    <option key={s} value={s}>
                      {POLICY_PACK_STATUS_LABEL_VI[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="kpiThreshold">KPI ngưỡng (0–100)</Label>
                {/* Score — không nhóm nghìn (UX_VI_DATE_NUMBER_FORMAT_AC exempt). */}
                <Input
                  id="kpiThreshold"
                  inputMode="numeric"
                  value={form.kpiThreshold}
                  onChange={(e) => update('kpiThreshold', e.target.value)}
                  className={cn(kpiInvalid && 'border-red-400')}
                  data-testid="pay-params-kpi-threshold"
                  placeholder="VD: 70"
                />
                {kpiInvalid && <p className="text-xs text-red-600">{MSG_KPI_RANGE}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="bccStd">BCC_STD (VNĐ)</Label>
                <ViMoneyInput
                  id="bccStd"
                  value={form.bccStd}
                  onValueChange={(value) => update('bccStd', value)}
                  data-testid="pay-params-bcc-std"
                  placeholder="0"
                />
              </div>
            </div>

            {/* KPI đã báo ngay dưới ô — không lặp lại ở cuối form. */}
            {fieldError && !kpiInvalid && <p className="text-sm text-red-600">{fieldError}</p>}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={pending} data-testid="pay-policy-pack-save">
                {pending ? 'Đang lưu…' : isEditing ? 'Cập nhật' : 'Lưu gói chính sách'}
              </Button>
              {isEditing && (
                <>
                  <Button type="button" variant="outline" onClick={startCreate}>
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleArchive}
                    disabled={pending}
                    data-testid="pay-policy-pack-archive"
                  >
                    Ngưng áp dụng
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
