/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương · Hub (L1–L6 navigation)
 * UC:         Spine UC-BP-PAY-STP-01..12
 * SRS:        docs/program/deltas/PO-HRM-PAY-CNTT-STP-SRS-DELTA-01.md §0
 * SA:         PO-HRM-PAY-CNTT-SA-01.md §2.1 L1–L6
 * UI:         docs/hrm/ui-screens/UI-HRM-PAY-STP-HUB.md — route `/hr/payroll/setup`,
 *             component `PayrollSetupHub` (`data-testid="pay-stp-hub-root"`), layout 2 pane
 *             (nav trái 1/4 · content phải 3/4), 6 mục nav §3.
 * Component:  PayrollSetupHub — nav-only shell; KHÔNG mutate tại hub (§3 "Không mutate tại hub").
 * Purpose:    Một cửa vào module Thiết lập lương — điều hướng L1–L6 giữa các child screen setup,
 *             tách khỏi "Lập bảng lương" runtime. Mục "Gói chính sách" render PolicyPackSetupScreen
 *             (component thật, 7/7 vitest PASS — xem qa-po-hrm-pay-cntt-fe-stp-01-cleanup-01.md).
 *             5 mục còn lại (Danh mục TP / Mẫu bảng / Profile nhập / Nhóm lương / panel Gợi ý cấu
 *             hình) CHƯA có component thật → placeholder honesty, không fake data/PASS.
 * must_keep:  data-testid="pay-stp-hub-root" (root) · "pay-stp-nav-*" (5 nav item, AC
 *             J-HRM-PAY-STP-NAV-01 "click path 5 nav items · URL đổi · không 404") · honesty
 *             banner sticky top nguyên văn §6 "Thiết lập đã lưu ≠ chạy bảng lương kỳ —
 *             payroll_e2e_ready=false" · KHÔNG hardcode enum BP trong DOM nav (AC-PAY-STP-GLOBAL-03)
 *             · KHÔNG mutate / gọi API ghi tại hub — chỉ nav + render child + resolve preview đọc.
 * NOT scope:  Không đổi logic PolicyPackSetupScreen.tsx / usePolicyPackApi.ts — chỉ import + render.
 *             5 mục placeholder KHÔNG implement CRUD — ngoài phạm vi work item này.
 * WorkItem:   PO-HRM-PAY-STP-HUB-ROUTE-WIRE-01
 * Coded:      2026-08-12
 */
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { resolveHrmSpreadsheetScope } from '@/lib/hrmSpreadsheetScope';
import { HRM_LIST_DEFAULT_COMPANY_ID, HRM_MASTER_TENANT_ID } from '@/lib/hrmListScope';
import { PolicyPackSetupScreen } from '../policy-pack/PolicyPackSetupScreen';
import { PayrollComponentsSetupScreen } from './PayrollComponentsSetupScreen';
import { PayrollGradeSetupScreen } from './PayrollGradeSetupScreen';
import { DecisionTypesSetupScreen } from './DecisionTypesSetupScreen';
import { ContractEmploymentTypesSetupScreen } from './ContractEmploymentTypesSetupScreen';
import { InsuranceTypesSetupScreen } from './InsuranceTypesSetupScreen';
import { OvertimeTypesSetupScreen } from './OvertimeTypesSetupScreen';
import { FormulaInputPackSetupScreen } from './FormulaInputPackSetupScreen';
import { SalaryTemplatesSetupScreen } from './SalaryTemplatesSetupScreen';
import { ImportProfileSetupScreen } from './ImportProfileSetupScreen';
import { ResolveConfigPanel } from './ResolveConfigPanel';

type SetupSectionId =
  | 'policy-pack'
  | 'components'
  | 'templates'
  | 'import-profile'
  | 'salary-groups'
  | 'resolve-panel'
  | 'decision-types'
  | 'contract-employment-types'
  | 'insurance-types'
  | 'overtime-types'
  | 'formula-input-pack';
type SetupSection = {
  id: SetupSectionId;
  label: string;
  testId: string;
  ready: boolean;
};

/** §3 IA layout — thứ tự + nhãn nguyên văn UI-HRM-PAY-STP-HUB.md, không hardcode enum BP. */
const SETUP_SECTIONS: SetupSection[] = [
  { id: 'policy-pack', label: 'Gói chính sách', testId: 'pay-stp-nav-policy-pack', ready: true },
  { id: 'components', label: 'Danh mục thành phần', testId: 'pay-stp-nav-components', ready: true },
  { id: 'templates', label: 'Mẫu bảng', testId: 'pay-stp-nav-templates', ready: true },
  { id: 'import-profile', label: 'Profile nhập', testId: 'pay-stp-nav-import-profile', ready: true },
  { id: 'salary-groups', label: 'Nhóm lương (Ngạch bậc)', testId: 'pay-stp-nav-salary-groups', ready: true },
  { id: 'decision-types', label: 'Loại quyết định', testId: 'pay-stp-nav-decision-types', ready: true },
  { id: 'contract-employment-types', label: 'Loại HĐ & LHDL', testId: 'pay-stp-nav-contract-employment-types', ready: true },
  { id: 'insurance-types', label: 'Loại bảo hiểm & Tỷ lệ', testId: 'pay-stp-nav-insurance-types', ready: true },
  { id: 'overtime-types', label: 'Loại OT & Loại trừ', testId: 'pay-stp-nav-overtime-types', ready: true },
  { id: 'formula-input-pack', label: 'Biến công thức (Allowlist)', testId: 'pay-stp-nav-formula-input-pack', ready: true },
  { id: 'resolve-panel', label: 'Gợi ý cấu hình', testId: 'pay-stp-nav-resolve-panel', ready: true },
];

const DEFAULT_SECTION: SetupSectionId = 'policy-pack';

function isSetupSectionId(value: string | null): value is SetupSectionId {
  return SETUP_SECTIONS.some((section) => section.id === value);
}
/** §6 honesty copy — nguyên văn, không diễn giải lại. */
const HONESTY_COPY =
  'Thiết lập đã lưu ≠ chạy bảng lương kỳ — payroll_e2e_ready=false';

function PlaceholderSection({ label }: { label: string }) {
  return (
    <Card data-testid="pay-stp-placeholder" className="border-dashed">
      <CardContent className="p-6 space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Chưa xây dựng — đang trong kế hoạch. Mục này chưa có màn hình thật; không có dữ liệu để
          hiển thị và không có thao tác nào khả dụng ở đây.
        </p>
      </CardContent>
    </Card>
  );
}
export function PayrollSetupHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const rawSection = searchParams.get('section');
  const activeSection: SetupSectionId = isSetupSectionId(rawSection) ? rawSection : DEFAULT_SECTION;

  const scope = useMemo(
    () =>
      resolveHrmSpreadsheetScope() ?? {
        tenantId: HRM_MASTER_TENANT_ID,
        companyId: HRM_LIST_DEFAULT_COMPANY_ID,
      },
    [],
  );

  const handleSelectSection = (id: SetupSectionId) => {
    const next = new URLSearchParams(searchParams);
    next.set('section', id);
    setSearchParams(next, { replace: false });
  };

  const handleRefreshScope = () => {
    void queryClient.invalidateQueries({ queryKey: ['pay-policy-packs'] });
  };

  const activeMeta = SETUP_SECTIONS.find((section) => section.id === activeSection) ?? SETUP_SECTIONS[0];

  return (
    <div className="p-4 md:p-6 space-y-4 xevn-safe-inline" data-testid="pay-stp-hub-root">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Thiết lập lương</h1>
          <p className="text-sm text-muted-foreground" data-testid="pay-stp-scope-label">
            Company scope: <span className="font-mono">{scope.companyId}</span>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefreshScope}
          data-testid="pay-stp-refresh-scope"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới scope
        </Button>
      </div>

      <Badge
        variant="outline"
        className="border-amber-300 bg-amber-50 text-amber-900 sticky top-0 z-10"
        data-testid="pay-stp-honesty-banner"
      >
        {HONESTY_COPY}
      </Badge>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <nav className="md:col-span-1 space-y-1" aria-label="Điều hướng thiết lập lương">
          {SETUP_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              data-testid={section.testId}
              aria-current={activeSection === section.id ? 'page' : undefined}
              onClick={() => handleSelectSection(section.id)}
              className={
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors ' +
                (activeSection === section.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-foreground hover:bg-muted')
              }
            >
              {section.label}
              {!section.ready && (
                <span className="ml-1 text-xs opacity-70">(chưa có)</span>
              )}
            </button>
          ))}
        </nav>

        <div className="md:col-span-3">
          {activeMeta.ready ? (
            activeMeta.id === 'policy-pack' ? (
              <PolicyPackSetupScreen />
            ) : activeMeta.id === 'components' ? (
              <PayrollComponentsSetupScreen />
            ) : activeMeta.id === 'salary-groups' ? (
              <PayrollGradeSetupScreen />
            ) : activeMeta.id === 'decision-types' ? (
              <DecisionTypesSetupScreen />
            ) : activeMeta.id === 'contract-employment-types' ? (
              <ContractEmploymentTypesSetupScreen />
            ) : activeMeta.id === 'insurance-types' ? (
              <InsuranceTypesSetupScreen />
            ) : activeMeta.id === 'overtime-types' ? (
              <OvertimeTypesSetupScreen />
            ) : activeMeta.id === 'formula-input-pack' ? (
              <FormulaInputPackSetupScreen />
            ) : null
          ) : (
            <PlaceholderSection label={activeMeta.label} />
          )}
        </div>
      </div>
    </div>
  );
}
