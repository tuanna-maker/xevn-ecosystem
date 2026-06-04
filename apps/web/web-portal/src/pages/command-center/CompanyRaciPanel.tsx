import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import { MASTER_TENANT_ID } from '../../constants/tenant';
import {
  formatTechnicalHint,
  resolveFeatureLabel,
  resolveModuleLabel,
  resolvePermissionLabel,
  resolveRaciLetterDisplay,
} from '../../data/raci-ecosystem-display-labels';
import { RACI_LETTER_MEANINGS, RACI_ORG_COLUMNS } from '../../data/xevn-raci-catalog';
import { listDeptSystemTemplates, type DeptSystemTemplateRow } from '../../integrations/deptSystemTemplatesApi';
import {
  buildRaciMatrixCellBody,
  fetchCompanyRaciMatrix,
  fetchRaciCapabilities,
  fetchRaciCatalog,
  fetchRaciCoverage,
  saveRaciMatrixCell,
  type RaciActivityRow,
  type RaciCapabilityRow,
  type RaciDomainSummary,
  type RaciMatrixRow,
} from '../../integrations/raciGovernanceApi';
import {
  raciCatalogSeedHint,
  readRaciColumnBindings,
  writeRaciColumnBinding,
} from '../../integrations/raciGovernanceHelpers';
import {
  SETTINGS_CONTROL_TEXT,
  SETTINGS_LABEL_CLASS,
  SETTINGS_PAGE_SUBTITLE_CLASS,
  SETTINGS_RADIUS_CARD,
  SETTINGS_RADIUS_INPUT,
  SETTINGS_SECTION_TITLE_CLASS,
} from './settings-form-pattern';

const RAIL_STROKE = 1.5;

type SubView = 'catalog' | 'matrix' | 'capabilities' | 'bindings';

export type CompanyRaciPanelProps = {
  /** Scope key for API matrix/coverage (resolved legal-entity UUID when available). */
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
  const tenantId = tenantIdHint?.trim() || MASTER_TENANT_ID;
  const [subView, setSubView] = useState<SubView>('matrix');
  const [domains, setDomains] = useState<RaciDomainSummary[]>([]);
  const [catalogActivities, setCatalogActivities] = useState<RaciActivityRow[]>([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [matrixRows, setMatrixRows] = useState<RaciMatrixRow[]>([]);
  const [capabilities, setCapabilities] = useState<RaciCapabilityRow[]>([]);
  const [activityNamesByCode, setActivityNamesByCode] = useState<Record<string, string>>({});
  const [coverage, setCoverage] = useState<Awaited<ReturnType<typeof fetchRaciCoverage>> | null>(null);
  const [columnBindings, setColumnBindings] = useState<Record<string, string>>({});
  const [deptTemplates, setDeptTemplates] = useState<DeptSystemTemplateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const catalogSeedHint = useMemo(
    () => raciCatalogSeedHint(catalogTotal, catalogActivities),
    [catalogTotal, catalogActivities],
  );

  const loadCatalog = useCallback(async () => {
    const catalog = await fetchRaciCatalog(undefined, tenantIdHint, companyIdHint);
    setDomains(catalog.domains);
    setCatalogActivities(catalog.activities ?? []);
    setCatalogTotal(catalog.total ?? catalog.activities?.length ?? 0);
    setActivityNamesByCode(
      Object.fromEntries((catalog.activities ?? []).map((a) => [a.activity_code, a.name])),
    );
    return catalog;
  }, [companyIdHint, tenantIdHint]);

  const loadMatrixForDomain = useCallback(
    async (domain: string) => {
      setMatrixLoading(true);
      try {
        const matrix = await fetchCompanyRaciMatrix(
          companyId,
          domain || undefined,
          tenantIdHint,
          companyIdHint,
        );
        setMatrixRows(matrix.rows);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Không tải được ma trận RACI');
        setMatrixRows([]);
      } finally {
        setMatrixLoading(false);
      }
    },
    [companyId, companyIdHint, tenantIdHint],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    setMessage(null);
    try {
      const catalog = await loadCatalog();
      const domain = domainFilter || catalog.domains[0]?.domain_code || '';
      if (!domainFilter && domain) setDomainFilter(domain);
      const [caps, cov] = await Promise.all([
        fetchRaciCapabilities(undefined, tenantIdHint, companyIdHint),
        fetchRaciCoverage(companyId, tenantIdHint, companyIdHint),
      ]);
      setCapabilities(caps);
      setCoverage(cov);
      await loadMatrixForDomain(domain);
      setColumnBindings(readRaciColumnBindings(tenantId, companyId));
    } catch (e) {
      setLoadFailed(true);
      setMessage(e instanceof Error ? e.message : 'Không tải được dữ liệu RACI');
    } finally {
      setLoading(false);
    }
  }, [companyId, companyIdHint, domainFilter, loadCatalog, loadMatrixForDomain, tenantId, tenantIdHint]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!domainFilter || loading) return;
    void loadMatrixForDomain(domainFilter);
  }, [domainFilter, loadMatrixForDomain, loading]);

  useEffect(() => {
    if (subView !== 'bindings') return;
    let cancelled = false;
    void listDeptSystemTemplates(tenantId, companyIdHint ?? undefined)
      .then((rows) => {
        if (!cancelled) setDeptTemplates(rows);
      })
      .catch(() => {
        if (!cancelled) setDeptTemplates([]);
      });
    return () => {
      cancelled = true;
    };
  }, [subView, tenantId, companyIdHint]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return matrixRows;
    return matrixRows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.activity_code.toLowerCase().includes(q),
    );
  }, [matrixRows, search]);

  const filteredCatalogRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = catalogActivities;
    if (domainFilter) rows = rows.filter((a) => a.domain_code === domainFilter);
    if (!q) return rows;
    return rows.filter(
      (a) => a.name.toLowerCase().includes(q) || a.activity_code.toLowerCase().includes(q),
    );
  }, [catalogActivities, domainFilter, search]);

  const onCellBlur = async (row: RaciMatrixRow, colId: string, value: string) => {
    const body = buildRaciMatrixCellBody(row.activity_id, colId, value);
    const prev = row.matrix[colId] ?? '';
    if (prev === body.raci_letters) return;
    try {
      await saveRaciMatrixCell(companyId, body, tenantIdHint, companyIdHint);
      setMatrixRows((rows) =>
        rows.map((r) =>
          r.activity_id === row.activity_id
            ? { ...r, matrix: { ...r.matrix, [colId]: body.raci_letters }, has_override: true }
            : r,
        ),
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Lưu ô ma trận thất bại');
    }
  };

  const onBindingChange = (colId: string, templateId: string) => {
    const next = writeRaciColumnBinding(tenantId, companyId, colId, templateId);
    setColumnBindings(next);
    setMessage(null);
  };

  const subTabs: { id: SubView; label: string }[] = [
    { id: 'catalog', label: 'Danh mục hoạt động' },
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

      <ApiLoadBanner
        loadFailed={loadFailed}
        title="RACI governance (UC-RACI-01..06)"
        message={
          loadFailed
            ? 'Không tải catalog/ma trận từ /api/xbos/raci-governance — kiểm tra xbos-api (28002) và đăng nhập.'
            : catalogSeedHint ?? undefined
        }
      />

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

      {(subView === 'matrix' || subView === 'catalog') && (
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
      )}

      {subView === 'catalog' ? (
        <div className={`overflow-x-auto border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
          <p className={`mb-3 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
            UC-RACI-01 — danh mục hoạt động chuẩn tập đoàn theo khối (API catalog).
          </p>
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-xevn-border bg-slate-50 text-slate-500">
                <th className="py-2 pr-3">STT</th>
                <th className="py-2 pr-3">Mã</th>
                <th className="py-2 pr-3">Khối</th>
                <th className="py-2">Tên hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCatalogRows.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 text-slate-500">{a.seq_no}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{a.activity_code}</td>
                  <td className="py-2 pr-3">{a.domain_label}</td>
                  <td className="py-2">{a.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredCatalogRows.length === 0 ? (
            <p className={`mt-3 ${SETTINGS_CONTROL_TEXT} text-slate-500`}>
              Không có hoạt động trong khối đã chọn.
            </p>
          ) : null}
        </div>
      ) : null}

      {subView === 'matrix' ? (
        <div className={`space-y-3 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
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
                          disabled={matrixLoading}
                          className="w-11 rounded border border-xevn-border px-0.5 py-1 text-center text-xs uppercase disabled:opacity-50"
                          aria-label={`${row.activity_code} ${c.orgUnit}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && !matrixLoading && filteredRows.length === 0 ? (
            <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>Không có hoạt động trong khối đã chọn.</p>
          ) : null}
        </div>
      ) : null}

      {subView === 'capabilities' ? (
        <div className={`overflow-x-auto border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
          <p className={`mb-3 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
            UC-RACI-03 — liên kết hoạt động với phân hệ và chức năng trên hệ sinh thái XEVN.
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
            UC-RACI-04 — gán cột RACI với khung chức danh (dept_system_templates). Lưu cục bộ trên
            trình duyệt cho đến khi API column-binding có trên xbos-api.
          </p>
          <ul className="mt-4 space-y-2">
            {RACI_ORG_COLUMNS.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-input border border-xevn-border px-3 py-2"
              >
                <span className="font-medium text-xevn-text">{c.workflowRoleLabel}</span>
                <select
                  value={columnBindings[c.id] ?? ''}
                  onChange={(e) => onBindingChange(c.id, e.target.value)}
                  className={`min-w-[14rem] ${SETTINGS_RADIUS_INPUT} border border-xevn-border px-2 py-1.5 text-sm`}
                  aria-label={`Gán chức danh cho ${c.workflowRoleLabel}`}
                >
                  <option value="">— Chưa gán —</option>
                  {deptTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} — {t.nameVi}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          {deptTemplates.length === 0 ? (
            <p className={`mt-3 ${SETTINGS_CONTROL_TEXT} text-amber-800`}>
              Chưa tải khung phòng/ban — mở tab Khung phòng/ban hoặc chạy seed business-master.
            </p>
          ) : null}
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
