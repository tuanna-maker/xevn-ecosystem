/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập → Gợi ý cấu hình
 * WorkItem:   PO-HRM-PAY-STP-RESOLVE-PANEL-FE-01
 * Coded:      2026-08-22
 */
import { useState } from 'react';
import { Lightbulb, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ResolveConfigPanel() {
  return (
    <div className="space-y-5" data-testid="pay-stp-resolve-panel">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-600"/>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-xevn-text">Gợi ý cấu hình thông minh</h3>
          <p className="text-sm text-xevn-textSecondary mt-0.5">Phân tích hệ thống và đề xuất các cấu hình cần thiết để tính lương tự động</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <Card className="border-xevn-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Cần cấu hình (3)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex-1">
                <p className="font-semibold text-sm">Chưa có mẫu lương cho "Lái xe trung chuyển"</p>
                <p className="text-xs text-muted-foreground mt-1">Phát hiện 12 nhân sự mới thuộc bộ phận Lái xe trung chuyển nhưng chưa được gán vào nhóm hay mẫu lương nào.</p>
              </div>
              <Button size="sm" variant="outline">Tạo mẫu <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex-1">
                <p className="font-semibold text-sm">Thiếu mapping KPI</p>
                <p className="text-xs text-muted-foreground mt-1">Profile import KPI tháng 8 chưa map cột "Doanh thu" với biến hệ thống.</p>
              </div>
              <Button size="sm" variant="outline">Sửa Profile <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-xevn-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Sẵn sàng (5)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="flex items-center gap-2 text-sm text-slate-600 p-2">
               <CheckCircle2 className="w-4 h-4 text-green-500" /> Cấu hình phụ cấp ăn trưa
             </div>
             <div className="flex items-center gap-2 text-sm text-slate-600 p-2">
               <CheckCircle2 className="w-4 h-4 text-green-500" /> Mẫu bảng lương VP HN
             </div>
             <div className="flex items-center gap-2 text-sm text-slate-600 p-2">
               <CheckCircle2 className="w-4 h-4 text-green-500" /> Ngạch bậc lương lái xe tuyến
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}