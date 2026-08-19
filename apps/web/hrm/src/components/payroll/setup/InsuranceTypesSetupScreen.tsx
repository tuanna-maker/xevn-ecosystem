/**
 * @CODE-MEMORY
 * Screen:                HRM Lương → Thiết lập lương → Loại bảo hiểm & Tỷ lệ đóng (Wave 5)
 * UC:                    UC-HRM-INS-TYPE-01..02
 * SRS:                   docs/program/deltas/BA_HRM_INSURANCE_TYPE_SRS_01_20260813.md
 * TechSpec:              docs/program/deltas/BA_HRM_INSURANCE_TYPE_TECHSPEC_01_20260813.md
 * UI:                    docs/hrm/ui-screens/UI-HRM-INSURANCE-TYPE-01.md
 * WorkItem:              D-PO-HRM-INS-TYPE-FE-01
 * solid_convention_ack:  Refactored to SOLID using useInsuranceTypes hook & CatalogHeaderBanner.
 */
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useInsuranceTypes } from './hooks/useInsuranceTypes';
import { CatalogHeaderBanner } from './components/CatalogHeaderBanner';

export function InsuranceTypesSetupScreen() {
  const { items, totals } = useInsuranceTypes();

  return (
    <div className="space-y-4" data-testid="insurance-types-setup-screen">
      <CatalogHeaderBanner
        message={
          <>
            Danh mục Loại bảo hiểm & Tỷ lệ trích nộp theo Luật Bảo hiểm Việt Nam (Tổng trích nộp: DN{' '}
            <strong>{totals.totalEmployer.toFixed(1)}%</strong> + NLĐ <strong>{totals.totalEmployee.toFixed(1)}%</strong> ={' '}
            <strong>{totals.grandTotal.toFixed(1)}%</strong>).
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" data-testid="insurance-types-table">
              <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Mã loại bảo hiểm</th>
                  <th className="px-4 py-3">Tên loại bảo hiểm</th>
                  <th className="px-4 py-3 text-center">Tỷ lệ DN đóng (%)</th>
                  <th className="px-4 py-3 text-center">Tỷ lệ NLĐ đóng (%)</th>
                  <th className="px-4 py-3 text-center">Tổng tỷ lệ (%)</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((ins) => (
                  <tr key={ins.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono font-medium">{ins.code}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{ins.name}</td>
                    <td className="px-4 py-3 text-center font-mono font-semibold text-purple-700">
                      {ins.employerRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-semibold text-sky-700">
                      {ins.employeeRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-emerald-700">
                      {(ins.employerRate + ins.employeeRate).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="mr-1 h-3 w-3 inline" /> Áp dụng
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/40 font-bold border-t text-xs uppercase">
                <tr>
                  <td colSpan={2} className="px-4 py-3">
                    Tổng cộng tỷ lệ trích nộp
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-purple-800 text-sm">
                    {totals.totalEmployer.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-sky-800 text-sm">
                    {totals.totalEmployee.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-800 text-sm">
                    {totals.grandTotal.toFixed(1)}%
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
