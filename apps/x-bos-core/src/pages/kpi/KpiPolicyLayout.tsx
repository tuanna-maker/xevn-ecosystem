import { Outlet } from 'react-router-dom';
import { KpiPolicyTabs } from '@/components/layout/KpiPolicyTabs';

export function KpiPolicyLayout() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <KpiPolicyTabs />
        <div className="h-px w-full bg-black/[0.06]" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-xevn-text">
              Quản trị KPI & chính sách thưởng/phạt
            </h1>
            <p className="mt-1 text-sm text-xevn-muted">
              Quản lý khai báo KPI, nhóm chính sách, khoảng mức và chạy tính thưởng/phạt theo kỳ.
            </p>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}

