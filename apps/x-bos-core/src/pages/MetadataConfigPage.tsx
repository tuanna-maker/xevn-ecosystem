import { useEffect, useMemo, useState } from 'react';
import { useXbosStore } from '@/store/useXbosStore';
import type { MetadataDataType } from '@/types';
import { OrgTabs } from '@/components/layout/OrgTabs';

export function MetadataConfigPage() {
  const metadataAttributes = useXbosStore((s) => s.metadataAttributes);
  const addMetadataAttribute = useXbosStore((s) => s.addMetadataAttribute);
  const categoryDefinitions = useXbosStore((s) => s.categoryDefinitions);

  const orgUnitFieldCount = useMemo(
    () => metadataAttributes.filter((m) => m.entityType === 'org_unit').length,
    [metadataAttributes]
  );

  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [dataType, setDataType] = useState<MetadataDataType>('text');
  const [required, setRequired] = useState(false);

  type SelectSource = 'MASTER' | 'MANUAL';
  const [selectSource, setSelectSource] = useState<SelectSource>('MASTER');
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('');

  const [manualOptionValue, setManualOptionValue] = useState('');
  const [manualOptionLabel, setManualOptionLabel] = useState('');
  const [manualOptions, setManualOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  const [boolTrueLabel, setBoolTrueLabel] = useState('Bật');
  const [boolFalseLabel, setBoolFalseLabel] = useState('Tắt');

  useEffect(() => {
    if (dataType !== 'select') return;
    const fallback = categoryDefinitions[0]?.code ?? '';
    setSelectedCategoryCode((prev) => prev || fallback);
    setSelectSource('MASTER');
    setManualOptions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataType, categoryDefinitions]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim() || !label.trim()) return;

    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
    const normalizedLabel = label.trim();
    const validationJson: Record<string, unknown> = { required };

    let refCategoryCode: string | undefined;
    let optionsJson: { value: string; label: string }[] | undefined;

    if (dataType === 'boolean') {
      validationJson.trueLabel = boolTrueLabel;
      validationJson.falseLabel = boolFalseLabel;
    }

    if (dataType === 'select') {
      if (selectSource === 'MASTER') {
        if (!selectedCategoryCode) return;
        refCategoryCode = selectedCategoryCode;
        optionsJson = undefined;
      } else {
        if (manualOptions.length === 0) return;
        optionsJson = manualOptions;
        refCategoryCode = undefined;
      }
    }

    addMetadataAttribute({
      entityType: 'org_unit',
      key: normalizedKey,
      label: normalizedLabel,
      dataType,
      validationJson,
      refCategoryCode,
      optionsJson,
      sortOrder: orgUnitFieldCount + 1,
    });
    setKey('');
    setLabel('');
    setRequired(false);
  }

  function addManualOption() {
    const v = manualOptionValue.trim();
    const l = manualOptionLabel.trim();
    if (!v || !l) return;
    setManualOptions((prev) => {
      if (prev.some((x) => x.value === v)) return prev;
      return [...prev, { value: v, label: l }];
    });
    setManualOptionValue('');
    setManualOptionLabel('');
  }

  return (
    <div className="space-y-8">
      <OrgTabs />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-xevn-text">
          Thiết lập trường bổ sung cho đơn vị
        </h1>
        <p className="mt-1 text-sm text-xevn-muted">
          Người quản trị có thể thêm các trường dữ liệu linh hoạt cho <span className="font-medium">đơn vị tổ chức</span>.
          Khi thêm mới trường, form tạo/sửa đơn vị sẽ tự cập nhật theo cấu hình.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-black/[0.06] bg-white/85 p-6 shadow-glass backdrop-blur-sm"
      >
        <h2 className="text-sm font-semibold text-xevn-text">Thêm trường mới cho đơn vị (org_unit)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Mã trường</span>
            <input
              className="input-apple"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="vd: internal_code"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Nhãn</span>
            <input
              className="input-apple"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Hiển thị trên form"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Kiểu</span>
            <select
              className="input-apple"
              value={dataType}
              onChange={(e) => setDataType(e.target.value as MetadataDataType)}
            >
              <option value="text">text</option>
              <option value="number">number</option>
              <option value="date">date</option>
              <option value="boolean">boolean</option>
              <option value="select">select</option>
            </select>
          </label>
          <label className="flex items-end gap-2 pb-1">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="rounded border-black/20"
            />
            <span className="text-sm text-xevn-text">Bắt buộc</span>
          </label>
        </div>

        {dataType === 'select' && (
          <div className="mt-5 rounded-2xl border border-black/[0.06] bg-white/70 p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-xevn-muted">
              Nguồn giá trị cho Select
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectSource('MASTER')}
                className={[
                  'rounded-xl px-4 py-2 text-sm font-medium border transition',
                  selectSource === 'MASTER'
                    ? 'border-xevn-primary/40 bg-xevn-primary/10 text-xevn-primary'
                    : 'border-black/[0.08] bg-white text-xevn-muted hover:bg-black/[0.02]',
                ].join(' ')}
              >
                Danh mục tập trung
              </button>
              <button
                type="button"
                onClick={() => setSelectSource('MANUAL')}
                className={[
                  'rounded-xl px-4 py-2 text-sm font-medium border transition',
                  selectSource === 'MANUAL'
                    ? 'border-xevn-primary/40 bg-xevn-primary/10 text-xevn-primary'
                    : 'border-black/[0.08] bg-white text-xevn-muted hover:bg-black/[0.02]',
                ].join(' ')}
              >
                Tự khai danh sách
              </button>
            </div>

            {selectSource === 'MASTER' ? (
              <div className="mt-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-xevn-muted">Danh mục cung cấp lựa chọn</span>
                  <select
                    className="input-apple"
                    value={selectedCategoryCode}
                    onChange={(e) => setSelectedCategoryCode(e.target.value)}
                  >
                    {categoryDefinitions.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-2 text-xs text-xevn-muted">
                  Giá trị lựa chọn của Select sẽ lấy từ trang <span className="font-medium">Danh mục tập trung</span> (Master Data).
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-xevn-muted">Giá trị (value)</span>
                    <input
                      className="input-apple font-mono"
                      value={manualOptionValue}
                      onChange={(e) => setManualOptionValue(e.target.value)}
                      placeholder="vd: CC-HQ"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-xevn-muted">Nhãn hiển thị</span>
                    <input
                      className="input-apple"
                      value={manualOptionLabel}
                      onChange={(e) => setManualOptionLabel(e.target.value)}
                      placeholder="vd: CC Trụ sở"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={addManualOption}
                  className="inline-flex items-center justify-center rounded-xl border border-xevn-primary/30 bg-xevn-primary/10 px-4 py-2 text-sm font-medium text-xevn-primary hover:bg-xevn-primary/15"
                >
                  + Thêm vào danh sách
                </button>

                <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Nhãn</th>
                        <th className="px-4 py-3 w-24" />
                      </tr>
                    </thead>
                    <tbody>
                      {manualOptions.map((o) => (
                        <tr key={o.value} className="border-b border-black/[0.04] last:border-0">
                          <td className="px-4 py-3 font-mono text-xs">{o.value}</td>
                          <td className="px-4 py-3">{o.label}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setManualOptions((prev) => prev.filter((x) => x.value !== o.value))}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-500/10"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                      {manualOptions.length === 0 && (
                        <tr>
                          <td className="px-4 py-4 text-xevn-muted" colSpan={3}>
                            Chưa có lựa chọn. Thêm ít nhất 1 dòng để lưu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {dataType === 'boolean' && (
          <div className="mt-5 rounded-2xl border border-black/[0.06] bg-white/70 p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-xevn-muted">
              Nhãn hiển thị cho Boolean
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-xevn-muted">Nhãn khi bật (true)</span>
                <input
                  className="input-apple"
                  value={boolTrueLabel}
                  onChange={(e) => setBoolTrueLabel(e.target.value)}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-xevn-muted">Nhãn khi tắt (false)</span>
                <input
                  className="input-apple"
                  value={boolFalseLabel}
                  onChange={(e) => setBoolFalseLabel(e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="mt-4 rounded-xl bg-xevn-primary px-5 py-2.5 text-sm font-medium text-white shadow-md"
        >
          Thêm trường
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80 shadow-glass">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Nhãn</th>
              <th className="px-4 py-3">Kiểu</th>
              <th className="px-4 py-3">Entity</th>
            </tr>
          </thead>
          <tbody>
            {metadataAttributes.map((m) => (
              <tr key={m.id} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{m.key}</td>
                <td className="px-4 py-3">{m.label}</td>
                <td className="px-4 py-3 text-xevn-muted">
                  {m.dataType === 'select' ? (
                    <>
                      select · {m.refCategoryCode ? `DNA:${m.refCategoryCode}` : 'tự khai'}
                    </>
                  ) : m.dataType === 'boolean' ? (
                    <>
                      boolean ·{' '}
                      {(m.validationJson as { trueLabel?: string; true_label?: string })
                        .trueLabel ?? (m.validationJson as { trueLabel?: string; true_label?: string }).true_label ?? 'Bật'}
                      /
                      {(m.validationJson as { falseLabel?: string; false_label?: string })
                        .falseLabel ?? (m.validationJson as { falseLabel?: string; false_label?: string }).false_label ?? 'Tắt'}
                    </>
                  ) : (
                    m.dataType
                  )}
                </td>
                <td className="px-4 py-3 text-xevn-muted">{m.entityType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
