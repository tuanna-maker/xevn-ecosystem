/**
 * @CODE-MEMORY
 * Screen:     HRM Payroll Setup - Biến công thức lương (Formula Input Pack)
 * Route:      /hr/payroll/setup/formula-input-pack (child of PayrollSetupHub)
 * UC:         FR-W10-04
 * WorkItem:   BA-HRM-PAYROLL-FORMULA-INPUT-PACK-FE-01
 * Coded:      2026-08-15
 * Callers:    PayrollSetupHub
 * Callees:    useFormulaVariableHints, CatalogHeaderBanner
 * Layout:     3 section - Core (7 lowercase vars) / Phụ cấp / Input Pack (13 source_kinds)
 * SOLID:      SRP - component chỉ render; không chứa business logic
 * fe_boundary: không query DB trực tiếp, không import từ BE source
 * display_ready_ack: text user-facing dùng tiếng Việt, không lộ FR-* hoặc AC-* ra UI
 * must_keep:  không DEFAULT_VARIABLES hardcoded (U65)
 *             không drag ordering buttons (không trong FR-W10-04)
 *             variable codes lowercase, không UPPERCASE
 */
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useFormulaVariableHints } from './hooks/useFormulaVariableHints';
import { CatalogHeaderBanner } from './components/CatalogHeaderBanner';

export function FormulaInputPackSetupScreen() {
  const {
    searchTerm,
    setSearchTerm,
    filteredCoreVars,
    filteredInputPack,
    showAllowanceSection,
    totalCoreVars,
    totalInputPackKinds,
  } = useFormulaVariableHints();

  return (
    <div className="space-y-6" data-testid="formula-input-pack-setup-screen">
      <CatalogHeaderBanner
        message={
          <>
            Danh mục biến công thức lương —{' '}
            <strong>{totalCoreVars} biến Core</strong> (ATT + C&amp;B) và{' '}
            <strong>{totalInputPackKinds} source kinds</strong> từ{' '}
            <span className="font-mono text-xs">pay_period_input_lines</span>.{' '}
            Chỉ đọc — cấu hình công thức tại màn hình Thành phần lương.
          </>
        }
      />

      {/* Search / Filter */}
      <div className="max-w-sm">
        <Input
          type="search"
          placeholder="Tìm kiếm biến, source kind..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="formula-search-input"
          aria-label="Tìm kiếm biến công thức"
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Section 1: Core (ATT + C&B) — 7 biến cố định, lowercase         */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="section-core">
        <h3
          id="section-core"
          className="text-base font-semibold mb-1 pb-2 border-b"
          data-testid="section-title-core"
        >
          Core (ATT + C&amp;B)
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          7 biến cố định từ chấm công và C&amp;B — không thay đổi theo cấu hình tenant
        </p>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left" data-testid="core-vars-table">
                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3">Biến</th>
                    <th className="px-4 py-3">Tên</th>
                    <th className="px-4 py-3">Nguồn dữ liệu</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCoreVars.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-muted-foreground text-xs italic"
                      >
                        Không có biến nào khớp với từ khóa tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredCoreVars.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">
                          {v.variableKey}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{v.label}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                          {v.dataSource}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Section 2: Phụ cấp — pattern động                               */}
      {/* ---------------------------------------------------------------- */}
      {showAllowanceSection && (
        <section aria-labelledby="section-allowance">
          <h3
            id="section-allowance"
            className="text-base font-semibold mb-1 pb-2 border-b"
            data-testid="section-title-allowance"
          >
            Phụ cấp
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Biến phụ cấp theo pattern động — không cố định, phụ thuộc vào gói lương nhân viên
          </p>
          <Card>
            <CardContent className="p-4">
              <div
                className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 text-sm space-y-2"
                data-testid="allowance-pattern-note"
              >
                <p>
                  <code className="bg-blue-100 text-blue-800 text-xs font-mono px-1.5 py-0.5 rounded">
                    {'allowance_{mã}'}
                  </code>
                  {' — giá trị lấy từ '}
                  <code className="bg-blue-100 text-blue-800 text-xs font-mono px-1.5 py-0.5 rounded">
                    employee_compensation_packages
                  </code>
                  {' theo từng mã phụ cấp đang áp dụng cho nhân viên trong kỳ lương.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {'Ví dụ: '}
                  <code className="bg-blue-100 text-blue-800 text-xs font-mono px-1.5 py-0.5 rounded">
                    allowance_xang_xe
                  </code>
                  {', '}
                  <code className="bg-blue-100 text-blue-800 text-xs font-mono px-1.5 py-0.5 rounded">
                    allowance_dien_thoai
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Section 3: Input Pack — 13 source_kinds từ pay_period_input_lines */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="section-input-pack">
        <h3
          id="section-input-pack"
          className="text-base font-semibold mb-1 pb-2 border-b"
          data-testid="section-title-input-pack"
        >
          Input Pack
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Source kinds từ{' '}
          <code className="font-mono text-xs">pay_period_input_lines</code>
          {' — giá trị nhập theo từng loại trong kỳ lương'}
        </p>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left" data-testid="input-pack-table">
                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3">Source Kind</th>
                    <th className="px-4 py-3">Tên hiển thị</th>
                    <th className="px-4 py-3">Mô tả nguồn</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInputPack.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-muted-foreground text-xs italic"
                      >
                        Không có source kind nào khớp với từ khóa tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredInputPack.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">
                          {v.sourceKind}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{v.label}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {v.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default FormulaInputPackSetupScreen;
