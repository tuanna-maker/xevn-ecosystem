import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  formatTechnicalHint,
  resolveFeatureLabel,
  resolveModuleLabel,
  resolvePermissionLabel,
  resolveRaciLetterDisplay,
} from '../../data/raci-ecosystem-display-labels';
import { RACI_LETTER_MEANINGS, RACI_ORG_COLUMNS } from '../../data/xevn-raci-catalog';
import {
  fetchCompanyRaciMatrix,
  fetchRaciCapabilities,
  fetchRaciCatalog,
  fetchRaciCoverage,
  saveRaciMatrixCell,
  type RaciCapabilityRow,
  type RaciDomainSummary,
  type RaciMatrixRow,
} from '../../integrations/raciGovernanceApi';
import {
  SETTINGS_CONTROL_TEXT,
  SETTINGS_LABEL_CLASS,
  SETTINGS_PAGE_SUBTITLE_CLASS,
  SETTINGS_RADIUS_CARD,
  SETTINGS_RADIUS_INPUT,
  SETTINGS_SECTION_TITLE_CLASS,
} from './settings-form-pattern';

const RAIL_STROKE = 1.5;

type SubView = 'matrix' | 'capabilities' | 'bindings';

export type CompanyRaciPanelProps = {
  companyId: string;
  companyLabel?: string;
  tenantIdHint?: string | null;
  companyIdHint?: string | null;
};

export const CompanyRaciPanel: React.FC<CompanyRaciPanelProps> = ({
  companyId,
  companyLabel,
  tenantIdHint,
  companyIdHint,
}) => {
  const [subView, setSubView] = useState<SubView>('matrix');
  const [domains, setDomains] = useState<RaciDomainSummary[]>([]);
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [matrixRows, setMatrixRows] = useState<RaciMatrixRow[]>([]);
  const [capabilities, setCapabilities] = useState<RaciCapabilityRow[]>([]);
  const [activityNamesByCode, setActivityNamesByCode] = useState<Record<string, string>>({});
  const [coverage, setCoverage] = useState<Awaited<ReturnType<typeof fetchRaciCoverage>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const catalog = await fetchRaciCatalog(undefined, tenantIdHint, companyIdHint);
      setDomains(catalog.domains);
      setActivityNamesByCode(
        Object.fromEntries(
          (catalog.activities ?? []).map((a) => [a.activity_code, a.name]),
        ),
      );
      const domain = domainFilter || catalog.domains[0]?.domain_code || '';
      if (!domainFilter && domain) setDomainFilter(domain);
      const [matrix, caps, cov] = await Promise.all([
        fetchCompanyRaciMatrix(companyId, domain || undefined, tenantIdHint, companyIdHint),
        fetchRaciCapabilities(undefined, tenantIdHint, companyIdHint),
        fetchRaciCoverage(companyId, tenantIdHint, companyIdHint),
      ]);
      setMatrixRows(matrix.rows);
      setCapabilities(caps);
      setCoverage(cov);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Không tải được dữ liệu RACI');
    } finally {
      setLoading(false);
    }
  }, [companyId, companyIdHint, domainFilter, tenantIdHint]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return matrixRows;
    return matrixRows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.activity_code.toLowerCase().includes(q),
    );
  }, [matrixRows, search]);

  const onCellBlur = async (row: RaciMatrixRow, colId: string, value: string) => {
    const prev = row.matrix[colId] ?? '';
    const next = value.trim().replace(/\s+/g, '').toUpperCase();
    if (prev === next) return;
    try {
      await saveRaciMatrixCell(
        companyId,
        { activity_id: row.activity_id, org_column_id: colId, raci_letters: next },
        tenantIdHint,
        companyIdHint,
      );
      setMatrixRows((rows) =>
        rows.map((r) =>
          r.activity_id === row.activity_id
            ? { ...r, matrix: { ...r.matrix, [colId]: next }, has_override: true }
            : r,
        ),
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Lưu ô ma trận thất bại');
    }
  };

  const subTabs: { id: SubView; label: string }[] = [
    { id: 'matrix', label: 'Ma trận RACI' },
    { id: 'capabilities', label: 'Ánh xạ phân hệ' },
    { id: 'bindings', label: 'Gán chức danh' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className={SETTINGS_SECTION_TITLE_CLASS}>Nhiệm vụ &amp; RACI</h4>
          <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
            {companyLabel ? `${companyLabel} · ` : ''}
            Ma trận nghiệp vụ tập đoàn, ánh xạ phân hệ XEVN và gán chức danh theo pháp nhân
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 text-[15px] font-medium text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={RAIL_STROKE} />
          Tải lại
        </button>
      </div>

      {coverage ? (
        <div className={`grid grid-cols-2 gap-3 border border-xevn-border p-4 md:grid-cols-4 ${SETTINGS_RADIUS_CARD}`}>
          <Stat label="Hoạt động" value={String(coverage.activities_total)} />
          <Stat label="Có chữ RACI" value={String(coverage.activities_with_matrix_letters)} />
          <Stat label="Đã gắn phân hệ" value={String(coverage.activities_with_capability_map)} />
          <Stat label="Tỷ lệ gắn phân hệ" value={`${coverage.capability_coverage_pct}%`} />
        </div>
      ) : null}

      {message ? <p className="text-sm text-rose-600">{message}</p> : null}

      <div className="flex flex-wrap gap-1 border-b border-xevn-border pb-1" role="tablist">
        {subTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={subView === id}
            onClick={() => setSubView(id)}
            className={`rounded-lg px-3 py-2 text-[15px] transition active:scale-95 ${
              subView === id
                ? 'border-b-2 border-xevn-primary font-bold text-xevn-primary'
                : 'font-normal text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subView === 'matrix' ? (
        <div className={`space-y-3 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[12rem]">
              <span className={SETTINGS_LABEL_CLASS}>Khối nghiệp vụ</span>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className={`mt-1 w-full ${SETTINGS_RADIUS_INPUT} border border-xevn-border px-3 py-2 text-[15px]`}
              >
                {domains.map((d) => (
                  <option key={d.domain_code} value={d.domain_code}>
                    {d.domain_label} ({d.count})
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[14rem] flex-1">
              <span className={SETTINGS_LABEL_CLASS}>Tìm hoạt động</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mã hoặc tên hoạt động..."
                className={`mt-1 w-full ${SETTINGS_RADIUS_INPUT} border border-xevn-border px-3 py-2 text-[15px]`}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            {RACI_LETTER_MEANINGS.map((m) => (
              <span key={m.letter}>
                <strong>{m.letter}</strong> — {m.labelVi}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-xevn-border bg-slate-50">
                  <th className="sticky left-0 z-10 min-w-[14rem] bg-slate-50 px-2 py-2 font-medium">Hoạt động</th>
                  {RACI_ORG_COLUMNS.map((c) => (
                    <th key={c.id} className="min-w-[3.25rem] px-1 py-2 text-center text-xs font-medium">
                      <span className="block truncate" title={c.orgUnit}>
                        {c.orgUnit}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.activity_id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="sticky left-0 z-10 bg-white px-2 py-1.5">
                      <span className="font-mono text-xs text-slate-500">{row.activity_code}</span>
                      <div className="text-[13px] leading-snug text-xevn-text">{row.name}</div>
                    </td>
                    {RACI_ORG_COLUMNS.map((c) => (
                      <td key={c.id} className="px-0.5 py-0.5 text-center">
                        <input
                          key={`${row.activity_id}-${c.id}-${row.matrix[c.id] ?? ''}`}
                          defaultValue={row.matrix[c.id] ?? ''}
                          onBlur={(e) => void onCellBlur(row, c.id, e.target.value)}
                          maxLength={4}
                          className="w-11 rounded border border-xevn-border px-0.5 py-1 text-center text-xs uppercase"
                          aria-label={`${row.activity_code} ${c.orgUnit}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredRows.length === 0 ? (
            <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>Không có hoạt động trong khối đã chọn.</p>
          ) : null}
        </div>
      ) : null}

      {subView === 'capabilities' ? (
        <div className={`overflow-x-auto border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
          <p className={`mb-3 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
            Liên kết hoạt động nghiệp vụ với phân hệ và chức năng trên hệ sinh thái XEVN. Di chuột vào ô để xem mã kỹ thuật (dành cho quản trị).
          </p>
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-xevn-border text-slate-500">
                <th className="min-w-[14rem] py-2 pr-3">Hoạt động nghiệp vụ</th>
                <th className="min-w-[10rem] py-2 pr-3">Phân hệ</th>
                <th className="min-w-[12rem] py-2 pr-3">Chức năng</th>
                <th className="min-w-[12rem] py-2 pr-3">Quyền thao tác</th>
                <th className="min-w-[8rem] py-2">Vai trò RACI</th>
              </tr>
            </thead>
            <tbody>
              {capabilities.map((cap, i) => {
                const activityName =
                  cap.activity_name?.trim() ||
                  activityNamesByCode[cap.activity_code] ||
                  cap.activity_code;
                const moduleLabel = resolveModuleLabel(cap.module_code);
                const featureLabel = resolveFeatureLabel(cap.feature_code);
                const permissionLabel = resolvePermissionLabel(cap.permission_code);
                const raciLabel = resolveRaciLetterDisplay(cap.raci_letter_required);
                const techHint = formatTechnicalHint({
                  'Mã HĐ': cap.activity_code,
                  module: cap.module_code,
                  feature: cap.feature_code,
                  permission: cap.permission_code,
                });
                return (
                  <tr key={`${cap.activity_code}-${cap.module_code}-${i}`} className="border-b border-slate-100">
                    <td className="py-2 pr-3" title={techHint}>
                      <div className="text-[13px] font-medium leading-snug text-xevn-text">{activityName}</div>
                      <span className="font-mono text-xs text-slate-400">{cap.activity_code}</span>
                    </td>
                    <td className="py-2 pr-3" title={`module: ${cap.module_code}`}>
                      {moduleLabel}
                    </td>
                    <td className="py-2 pr-3" title={`feature: ${cap.feature_code}`}>
                      {featureLabel}
                    </td>
                    <td
                      className="py-2 pr-3 text-slate-700"
                      title={cap.permission_code ? `permission: ${cap.permission_code}` : undefined}
                    >
                      {permissionLabel}
                    </td>
                    <td className="py-2 font-medium text-xevn-text" title={cap.raci_letter_required ?? undefined}>
                      {raciLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {capabilities.length === 0 ? (
            <p className={`mt-3 ${SETTINGS_CONTROL_TEXT} text-slate-500`}>
              Chưa có ánh xạ phân hệ cho tenant này.
            </p>
          ) : null}
        </div>
      ) : null}

      {subView === 'bindings' ? (
        <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
          <p className={SETTINGS_PAGE_SUBTITLE_CLASS}>
            Gán cột RACI với chức danh / đơn vị tổ chức — form chỉnh sửa sắp có; hiện tham chiếu 18 cột
            chuẩn tập đoàn.
          </p>
          <ul className="mt-4 space-y-2">
            {RACI_ORG_COLUMNS.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-input border border-xevn-border px-3 py-2"
              >
                <span className="font-medium text-xevn-text">{c.workflowRoleLabel}</span>
                <span className="text-sm text-slate-500">{c.id}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-xevn-text">{value}</p>
    </div>
  );
}
