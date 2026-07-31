/**
 * @CODE-MEMORY
 * Screen:     HRM embed — Đơn vị thành viên filter + compact role/ĐVTV context
 * UC:         BM-AC-02-01..03 · AC-CD-F3-02/03/06 · J-HRM-INT-05
 * BR:         BR-CD-F3-03 — OU filter ≠ token company mutate; BR-CD-F3-01 — role VI not UUID
 * SRS:        docs/program/deltas/BMINUTES_AC_MATRIX.md BM-AC-02-01..03
 * TechSpec:   docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md §3 / U39 operating units
 * Purpose:    Group CEO: OU select + «Đang xem» + role VI chip. Member / filter-hidden:
 *             compact static ĐVTV + role (no switcher). Never restores deleted annotation strip.
 * WorkItem:   BM-FE-ROLE-SWITCH-01
 * Coded:      2026-07-22
 * Callers:    AppLayout (portal embed)
 * Callees:    useHrmOperatingUnitFilter, getPortalJwtRoleCode, resolveEmbedWorkingContext
 * FEActions:  OU select → setSelectedSlug (query scope only); role chip read-only from portal roleCode
 * Impact:     Restoring deleted annotation strip violates CD-FB-06 sponsor lock
 * must_keep:  OU filter + invalidate; TopHeader select-membership on portal; OU must not mutate token companyId
 * SOLID:      Presentation only — filter state in HrmOperatingUnitFilterContext
 * LastVerified: embedWorkingContext.test.ts + scopeRoleLabels.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 BM-FE-ROLE-SWITCH-01
 * what: Compact role VI (+ ĐVTV) on embed surface without annotation strip
 * why: BM-AC-02-01 gap after CD-FB-06-REMOVE-SCOPE-ANNOTATIONS
 * must_keep: HrmOperatingUnitFilter behavior; member hide OU rollup
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 XEVN-THM-FE-W1-HRM
 * what: Pale slate-300 separators + slate body → text-xevn-text|Secondary|Muted; role chip text-sm
 * why: L-CONTRAST ADR sharp-ops; inventory FE-W1-HRM embed chrome
 * must_keep: OU filter + role chip testids; no annotation strip
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 D-HRM-EMP-COMPANY-COL-FE-01
 * what: aria-label filter «đơn vị thành viên» (align AC-EMP-COL-07 with company column SoT)
 * why: Avoid «vận hành/Khối» copy vs cột Thông tin công ty LE names
 * must_keep: Select options still from operating-units API display_name_vi
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-HRM-OU-FILTER-EMBED-01
 * what: SelectContent portalScope=iframe; loading row không trùng SelectItem value=all
 * why: CC embed — parent portal detach + Radix duplicate value làm dropdown biến mất
 * must_keep: OU ≠ JWT mutate; member compact chip; Dialog parent portal không đổi
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { getPortalJwtRoleCode, getPortalJwtTenantId } from '@/lib/hrmSpreadsheetScope';
import { resolveEmbedWorkingContext } from '@/lib/embedWorkingContext';

/**
 * Group CEO operating-unit switcher — token companyId stays main; API query uses selected slug (U39).
 * BM-AC-02-01: also surfaces role VI (+ ĐVTV) on embed without tech annotation chrome.
 */
export function HrmOperatingUnitFilter() {
  const location = useLocation();
  const portalEmbed = getHrmPortalMode(location.search);
  const { showFilter, units, unitsLoading, selectedSlug, setSelectedSlug } =
    useHrmOperatingUnitFilter();

  if (!portalEmbed) return null;

  const selectedUnit =
    selectedSlug === 'all'
      ? null
      : units.find((unit) => unit.operating_slug === selectedSlug) ?? null;

  const { dvtvLabel, roleLabel } = resolveEmbedWorkingContext({
    showOuFilter: showFilter,
    selectedSlug,
    selectedUnitDisplayNameVi: selectedUnit?.display_name_vi ?? null,
    jwtTenantId: getPortalJwtTenantId(),
    roleCode: getPortalJwtRoleCode(),
  });

  if (!showFilter) {
    return (
      <div
        className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-xevn-border bg-xevn-background/90 px-3 py-2 text-sm"
        data-testid="hrm-embed-working-context"
      >
        <Building2 className="h-4 w-4 shrink-0 text-xevn-textMuted" aria-hidden />
        <span className="font-medium text-xevn-text" data-testid="hrm-embed-dvtv-label">
          {dvtvLabel}
        </span>
        <span className="text-xevn-textMuted" aria-hidden>
          ·
        </span>
        <span
          className="text-sm font-medium text-xevn-textSecondary"
          data-testid="hrm-embed-role-chip"
        >
          {roleLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-xevn-border bg-xevn-background/90 px-3 py-2 text-sm">
      <Building2 className="h-4 w-4 shrink-0 text-xevn-textMuted" aria-hidden />
      <span className="font-medium text-xevn-text">Đơn vị thành viên</span>
      <Select
        value={selectedSlug}
        onValueChange={(value) => setSelectedSlug(value as typeof selectedSlug)}
      >
        <SelectTrigger className="h-8 w-[min(100%,16rem)] bg-white" aria-label="Lọc đơn vị thành viên">
          <SelectValue placeholder="Tất cả đơn vị" />
        </SelectTrigger>
        <SelectContent portalScope="iframe">
          <SelectItem value="all">Tất cả đơn vị (rollup)</SelectItem>
          {unitsLoading && units.length === 0 ? (
            <div
              className="flex cursor-default items-center gap-2 py-1.5 pl-8 pr-2 text-sm text-xevn-textMuted"
              role="status"
              aria-live="polite"
              data-testid="hrm-operating-unit-loading"
            >
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Đang tải…
            </div>
          ) : (
            units.map((unit) => (
              <SelectItem key={unit.operating_slug} value={unit.operating_slug}>
                {unit.display_name_vi}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {selectedUnit ? (
        <span
          className="text-sm font-medium text-xevn-textSecondary"
          data-testid="hrm-operating-unit-viewing-banner"
        >
          Đang xem: {selectedUnit.display_name_vi}
        </span>
      ) : (
        <span className="text-sm text-xevn-textSecondary">Đang xem: Tất cả đơn vị (rollup)</span>
      )}
      <span className="text-xevn-textMuted" aria-hidden>
        ·
      </span>
      <span
        className="text-sm font-medium text-xevn-textSecondary"
        data-testid="hrm-embed-role-chip"
        title="Vai trò phiên làm việc"
      >
        {roleLabel}
      </span>
    </div>
  );
}
