// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Dialog: Thêm công ty mới — tất cả fields theo spec WI-02

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { listIndustryOptions } from '@/lib/industryDictionary';
import type { CreateCompanyPayload, TenantKind, TenantModule } from '@/integrations/xbosApi';

type Props = {
  onClose: () => void;
  onCreate: (payload: CreateCompanyPayload) => Promise<void>;
};

type FormErrors = Partial<Record<keyof CreateCompanyPayload | 'root', string>>;

const TENANT_CODE_RE = /^[a-z][a-z0-9-]*[a-z0-9]$/;

export function AddCompanyDialog({ onClose, onCreate }: Props) {
  const [tenantCode, setTenantCode] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [tenantKind, setTenantKind] = useState<TenantKind>('member');
  const [modules, setModules] = useState<TenantModule[]>(['hrm']);
  const [legalCode, setLegalCode] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  // Industry is a catalog-backed select (TECHSPEC §20.3). Value = canonical
  // key or free-text VI; persisted to `businessLines` on legal-entity upsert.
  const [industry, setIndustry] = useState('');
  const [legalExpanded, setLegalExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Đóng bằng Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function toggleModule(mod: TenantModule) {
    setModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    const code = tenantCode.trim();
    if (!code) {
      errs.tenantCode = 'Mã tenant không được để trống.';
    } else if (!TENANT_CODE_RE.test(code)) {
      errs.tenantCode = 'Chỉ dùng chữ thường, số và dấu gạch ngang. VD: xe-du-lich';
    }
    if (!name.trim()) errs.name = 'Tên đầy đủ không được để trống.';
    if (!shortName.trim()) errs.shortName = 'Tên ngắn không được để trống.';
    if (modules.length === 0) errs.modules = 'Chọn ít nhất một phân hệ.';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload: CreateCompanyPayload = {
        tenantCode: tenantCode.trim(),
        name: name.trim(),
        shortName: shortName.trim(),
        tenantKind,
        modules,
        legalEntity: {
          code: legalCode.trim() || undefined,
          name: legalName.trim() || undefined,
          taxCode: taxCode.trim() || undefined,
          businessLines: industry.trim() || undefined,
        },
      };
      await onCreate(payload);
      onClose();
    } catch (err) {
      setErrors({
        root: err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-company-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white/97 shadow-overlay backdrop-blur-sm"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
          <div>
            <div id="add-company-title" className="text-lg font-semibold tracking-tight text-xevn-text">
              Thêm công ty mới
            </div>
            <div className="mt-0.5 text-sm text-xevn-muted">
              Sau khi tạo, trạng thái sẽ là &ldquo;Đang cấp phép&rdquo;. Kích hoạt để hoàn tất.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-xevn-muted hover:bg-black/[0.04]"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4">
            {/* Root error */}
            {errors.root && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.root}
              </div>
            )}

            {/* Mã tenant */}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-xevn-text/90">
                Mã tenant <span className="text-red-500">*</span>
              </span>
              <input
                className={`input-apple font-mono text-xs ${errors.tenantCode ? 'ring-2 ring-red-400/40 border-red-300' : ''}`}
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value.toLowerCase())}
                placeholder="vd: xe-du-lich"
                autoComplete="off"
                spellCheck={false}
              />
              {errors.tenantCode && (
                <p className="text-xs text-red-600">{errors.tenantCode}</p>
              )}
              <p className="text-xs text-xevn-muted">
                Chỉ dùng chữ thường, số và dấu gạch ngang. Không thể thay đổi sau khi tạo.
              </p>
            </label>

            {/* Tên đầy đủ */}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-xevn-text/90">
                Tên đầy đủ <span className="text-red-500">*</span>
              </span>
              <input
                className={`input-apple ${errors.name ? 'ring-2 ring-red-400/40 border-red-300' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: XeVN Du Lịch"
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </label>

            {/* Tên ngắn */}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-xevn-text/90">
                Tên ngắn <span className="text-red-500">*</span>
              </span>
              <input
                className={`input-apple ${errors.shortName ? 'ring-2 ring-red-400/40 border-red-300' : ''}`}
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="VD: XeVN DL"
              />
              {errors.shortName && (
                <p className="text-xs text-red-600">{errors.shortName}</p>
              )}
            </label>

            {/* Loại */}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-xevn-text/90">
                Loại <span className="text-red-500">*</span>
              </span>
              <select
                className="input-apple"
                value={tenantKind}
                onChange={(e) => setTenantKind(e.target.value as TenantKind)}
              >
                <option value="member">Thành viên</option>
                <option value="master">Chủ sở hữu</option>
              </select>
            </label>

            {/* Phân hệ */}
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-xevn-text/90">
                Phân hệ được phép <span className="text-red-500">*</span>
              </span>
              <div className="flex flex-wrap gap-3 pt-1">
                {(['hrm', 'logistics'] as TenantModule[]).map((mod) => (
                  <label key={mod} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={modules.includes(mod)}
                      onChange={() => toggleModule(mod)}
                      className="h-4 w-4 rounded border-black/20 text-xevn-primary focus:ring-xevn-primary/20"
                    />
                    <span className="text-sm text-xevn-text">
                      {mod === 'hrm' ? 'HRM' : 'Logistics'}
                    </span>
                  </label>
                ))}
              </div>
              {errors.modules && (
                <p className="text-xs text-red-600">{errors.modules}</p>
              )}
            </div>

            {/* Thông tin pháp nhân — thu gọn */}
            <div className="rounded-xl border border-black/[0.06] bg-black/[0.01]">
              <button
                type="button"
                onClick={() => setLegalExpanded((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-xevn-text/80 hover:text-xevn-text"
              >
                <span>Thông tin pháp nhân (tùy chọn)</span>
                <span className="text-xevn-muted">{legalExpanded ? '▲' : '▼'}</span>
              </button>
              {legalExpanded && (
                <div className="border-t border-black/[0.06] px-4 pb-4 pt-3 space-y-4">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-xevn-text/90">Mã</span>
                    <input
                      className="input-apple font-mono text-xs"
                      value={legalCode}
                      onChange={(e) => setLegalCode(e.target.value)}
                      placeholder="VD: XDL"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-xevn-text/90">Tên pháp nhân</span>
                    <input
                      className="input-apple"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="VD: Công ty CP XeVN Du Lịch"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-xevn-text/90">Mã số thuế (MST)</span>
                    <input
                      className="input-apple font-mono text-xs"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      placeholder="VD: 0123456789"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-xevn-text/90">Ngành nghề kinh doanh</span>
                    <select
                      className="input-apple"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      <option value="">— Chọn ngành nghề —</option>
                      {listIndustryOptions().map((opt: { code: string; label: string }) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-xevn-muted">
                      Chọn từ danh mục chuẩn (SoT XBOS). Nếu ngành nghề của bạn chưa có trong danh mục, chọn «Khác» và ghi rõ tên bằng tiếng Việt vào ô tự do.
                    </p>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-black/[0.06] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-xevn-muted hover:bg-black/[0.04]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-xevn-primary px-5 py-2 text-sm font-medium text-white shadow-md shadow-xevn-primary/25 hover:bg-xevn-accent disabled:opacity-60"
            >
              {submitting ? 'Đang tạo...' : 'Xác nhận thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
