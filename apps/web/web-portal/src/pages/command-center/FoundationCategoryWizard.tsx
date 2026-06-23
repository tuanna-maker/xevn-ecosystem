import { useEffect, useState } from 'react';
import { ArrowLeft, Check, FileArchive, X } from 'lucide-react';
import type { InfrastructureFoundationCategory } from '../../data/infrastructure-foundation-catalog';
import { AutoResizeTextarea, SETTINGS_COL, SETTINGS_FIELD_SHELL, SETTINGS_LABEL_CLASS, SETTINGS_PAGE_SUBTITLE_CLASS, SETTINGS_PAGE_TITLE_CLASS, SETTINGS_RADIUS_CARD, SETTINGS_SECTION_GRID, SETTINGS_SECTION_TITLE_CLASS, XEVN_VIEWPORT_PADDING } from './settings-form-pattern';
import { MutationButton } from '../../components/common/MutationButton';

export type FoundationLegalEntityOption = {
  id: string;
  code: string;
  name: string;
};

export type FoundationCategoryWizardProps = {
  open: boolean;
  mode: 'create' | 'edit';
  form: InfrastructureFoundationCategory;
  onFormChange: (
    updater: (prev: InfrastructureFoundationCategory) => InfrastructureFoundationCategory,
  ) => void;
  legalEntities: FoundationLegalEntityOption[];
  onToggleCompany: (companyId: string) => void;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  confirming: boolean;
  message?: string | null;
  fieldsPreviewEntityId: string | null;
  onFieldsPreviewEntityChange: (entityId: string) => void;
  onConfigureFields: () => void;
  visibleFieldCount: number;
};

const STEPS = [
  { id: 1, label: 'Thông tin' },
  { id: 2, label: 'Phạm vi pháp nhân' },
  { id: 3, label: 'Khối & trường' },
] as const;

const RAIL_STROKE = 1.75;

export function FoundationCategoryWizard({
  open,
  mode,
  form,
  onFormChange,
  legalEntities,
  onToggleCompany,
  onCancel,
  onConfirm,
  confirming,
  message,
  fieldsPreviewEntityId,
  onFieldsPreviewEntityChange,
  onConfigureFields,
  visibleFieldCount,
}: FoundationCategoryWizardProps) {
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setStepError(null);
    }
  }, [open, form.id]);

  if (!open) return null;

  function goNext() {
    setStepError(null);
    if (step === 1) {
      if (!form.code.trim()) {
        setStepError('Vui lòng nhập mã danh mục nền (Origin).');
        return;
      }
      if (!form.nameVi.trim()) {
        setStepError('Vui lòng nhập tên danh mục nền.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!form.appliesToCompanyIds.length) {
        setStepError('Chọn ít nhất một pháp nhân trong phạm vi áp dụng.');
        return;
      }
      const first = form.appliesToCompanyIds[0];
      if (first && !fieldsPreviewEntityId) onFieldsPreviewEntityChange(first);
      setStep(3);
    }
  }

  function goBack() {
    setStepError(null);
    if (step > 1) setStep(step - 1);
  }

  const title =
    mode === 'create'
      ? 'Thêm danh mục nền hạ tầng'
      : `Sửa danh mục — ${form.code.trim() || form.nameVi.trim() || '…'}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-slate-900/35 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="foundation-category-wizard-title"
    >
      <header className={`shrink-0 border-b border-xevn-border bg-white/85 py-3 shadow-soft backdrop-blur-md ${XEVN_VIEWPORT_PADDING}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 id="foundation-category-wizard-title" className={SETTINGS_PAGE_TITLE_CLASS}>
              {title}
            </h2>
            <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
              Ba bước: mã/tên → phạm vi pháp nhân → cấu hình khối/trường trước khi áp dụng.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Đóng wizard"
          >
            <X className="h-5 w-5" strokeWidth={RAIL_STROKE} />
          </button>
        </div>
        <ol className="mt-4 flex flex-wrap gap-2">
          {STEPS.map((s) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <li
                key={s.id}
                className={`inline-flex items-center gap-2 rounded-input px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-xevn-primary text-white shadow-soft'
                    : done
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border border-xevn-border bg-white text-slate-600'
                }`}
              >
                {done ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                <span>
                  {s.id}. {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </header>

      <div className={`flex-1 overflow-y-auto py-6 ${XEVN_VIEWPORT_PADDING}`}>
        {stepError ? (
          <p
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            role="alert"
          >
            {stepError}
          </p>
        ) : null}
        {message ? (
          <p
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
            role="alert"
          >
            {message}
          </p>
        ) : null}

        {step === 1 ? (
          <div className={`space-y-6 border border-xevn-border bg-white p-6 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
            <h3 className={SETTINGS_SECTION_TITLE_CLASS}>Mã, tên và mô tả</h3>
            <div className={SETTINGS_SECTION_GRID}>
              <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                <span className={SETTINGS_LABEL_CLASS}>Mã danh mục nền *</span>
                <input
                  value={form.code}
                  onChange={(e) =>
                    onFormChange((s) => ({ ...s, code: e.target.value }))
                  }
                  placeholder="VD: HT-LOG-CS"
                  className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base tabular-nums outline-none focus:ring-2 focus:ring-xevn-accent/30"
                  aria-label="Mã danh mục nền"
                />
              </label>
              <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span8}`}>
                <span className={SETTINGS_LABEL_CLASS}>Tên danh mục *</span>
                <input
                  value={form.nameVi}
                  onChange={(e) =>
                    onFormChange((s) => ({ ...s, nameVi: e.target.value }))
                  }
                  className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-xevn-accent/30"
                  aria-label="Tên danh mục nền"
                />
              </label>
              <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span12}`}>
                <span className={SETTINGS_LABEL_CLASS}>Mô tả</span>
                <AutoResizeTextarea
                  value={form.description ?? ''}
                  onChange={(v) => onFormChange((s) => ({ ...s, description: v }))}
                  className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-xevn-accent/30"
                  aria-label="Mô tả danh mục"
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className={`space-y-4 border border-xevn-border bg-white p-6 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
            <h3 className={SETTINGS_SECTION_TITLE_CLASS}>Phạm vi pháp nhân</h3>
            <p className={SETTINGS_PAGE_SUBTITLE_CLASS}>
              Chọn pháp nhân phải dùng danh mục này — chỉ đơn vị được tick mới nhập giá trị điểm hạ tầng
              theo biểu mẫu đã cấu hình.
            </p>
            <div className="flex flex-wrap gap-3">
              {legalEntities.map((c) => {
                const selected = form.appliesToCompanyIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onToggleCompany(c.id)}
                    className={`inline-flex items-center gap-2 rounded-input border px-3 py-2 text-[15px] font-medium shadow-sm transition active:scale-[0.99] ${
                      selected
                        ? 'border-xevn-primary bg-xevn-primary/10 text-xevn-primary ring-2 ring-xevn-accent/25'
                        : 'border-xevn-border bg-white text-xevn-text hover:bg-slate-50'
                    }`}
                    aria-pressed={selected}
                  >
                    {selected ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                    <span>
                      {c.code} — {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-slate-500">
              Đã chọn: <span className="font-semibold text-xevn-text">{form.appliesToCompanyIds.length}</span>{' '}
              pháp nhân
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className={`space-y-4 border border-xevn-border bg-white p-6 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
            <h3 className={SETTINGS_SECTION_TITLE_CLASS}>Cấu hình khối &amp; trường</h3>
            <p className={SETTINGS_PAGE_SUBTITLE_CLASS}>
              Chọn pháp nhân xem trước biểu mẫu, mở cấu hình khối/trường inline (popup lồng). Sau khi xác nhận,
              danh mục và cấu hình được lưu lên DB.
            </p>
            {form.appliesToCompanyIds.length ? (
              <div className="flex flex-wrap gap-2">
                {form.appliesToCompanyIds.map((entityId) => {
                  const entity = legalEntities.find((c) => c.id === entityId);
                  const active = fieldsPreviewEntityId === entityId;
                  return (
                    <button
                      key={entityId}
                      type="button"
                      onClick={() => onFieldsPreviewEntityChange(entityId)}
                      className={`rounded-input border px-3 py-1.5 text-sm font-semibold transition ${
                        active
                          ? 'border-xevn-primary bg-xevn-primary text-white'
                          : 'border-xevn-border bg-white text-xevn-text hover:bg-slate-50'
                      }`}
                    >
                      {entity ? `${entity.code} — ${entity.name}` : entityId}
                    </button>
                  );
                })}
              </div>
            ) : null}
            <div className="rounded-card border border-dashed border-xevn-border bg-slate-50/80 p-5">
              <p className="text-sm text-slate-600">
                Trường hiển thị (pháp nhân xem trước):{' '}
                <span className="font-semibold text-xevn-text">{visibleFieldCount}</span>
              </p>
              <button
                type="button"
                disabled={!fieldsPreviewEntityId}
                onClick={onConfigureFields}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-input border border-xevn-border bg-white px-4 py-2.5 text-[15px] font-semibold text-xevn-primary shadow-soft transition hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileArchive className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                Cấu hình khối &amp; trường
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <footer className={`shrink-0 border-t border-xevn-border bg-white/90 py-3 shadow-soft backdrop-blur-md ${XEVN_VIEWPORT_PADDING}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={confirming}
              className="rounded-input border border-xevn-border bg-white px-4 py-2 text-[15px] font-semibold text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              Hủy
            </button>
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={confirming}
                className="inline-flex items-center gap-2 rounded-input border border-xevn-border bg-white px-4 py-2 text-[15px] font-semibold text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                Quay lại
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={confirming}
                className="rounded-input bg-xevn-primary px-4 py-2 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                Tiếp theo
              </button>
            ) : (
              <MutationButton
                pending={confirming}
                onClick={() => {
                  void onConfirm();
                }}
                className="rounded-input border-0 bg-xevn-primary px-5 py-2 text-[15px] font-semibold text-white shadow-soft hover:opacity-90"
              >
                Xác nhận &amp; áp dụng
              </MutationButton>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
