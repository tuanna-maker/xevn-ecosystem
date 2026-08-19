/**
 * @CODE-MEMORY
 * Screen:                HRM Lương → Thiết lập lương → Loại OT & Phạm vi loại trừ (Wave 6)
 * UC:                    UC-HRM-OT-TYPE-01..02
 * SRS:                   docs/program/deltas/BA_HRM_OVERTIME_TYPE_SRS_01_20260813.md
 * TechSpec:              docs/program/deltas/BA_HRM_OVERTIME_TYPE_TECHSPEC_01_20260813.md
 * UI:                    docs/hrm/ui-screens/UI-HRM-OVERTIME-TYPE-01.md
 * WorkItem:              D-PO-HRM-OT-TYPE-FE-01
 * solid_convention_ack:  Refactored to SOLID using useOvertimeTypes hook & CatalogHeaderBanner.
 */
import { Clock, CheckCircle2, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useOvertimeTypes } from './hooks/useOvertimeTypes';
import { CatalogHeaderBanner } from './components/CatalogHeaderBanner';

export function OvertimeTypesSetupScreen() {
  const { items } = useOvertimeTypes();

  return (
    <div className="space-y-4" data-testid="overtime-types-setup-screen">
      <CatalogHeaderBanner
        variant="warning"
        message={
          <>
            <strong>Quy tắc Loại trừ OT Lái xe:</strong> Đối tượng Lái xe đường dài hưởng lương đơn giá lượt/chuyến — <strong>không tính OT theo giờ</strong>.
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" data-testid="overtime-types-table">
              <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Mã loại OT</th>
                  <th className="px-4 py-3">Tên loại OT</th>
                  <th className="px-4 py-3 text-center">Hệ số lương làm thêm</th>
                  <th className="px-4 py-3">Phạm vi loại trừ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((ot) => (
                  <tr key={ot.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono font-medium">{ot.code}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{ot.name}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-sky-700">
                      <Clock className="mr-1 h-3.5 w-3.5 inline" />
                      {ot.multiplier.toFixed(1)}x ({(ot.multiplier * 100).toFixed(0)}%)
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-rose-100 text-rose-800 border-rose-300">
                        <Truck className="mr-1 h-3 w-3 inline" /> {ot.excludedGroup}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="mr-1 h-3 w-3 inline" /> Áp dụng
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
