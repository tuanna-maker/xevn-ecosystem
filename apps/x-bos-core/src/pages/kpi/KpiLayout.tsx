import { Outlet } from 'react-router-dom';
import { KpiTabs } from '@/components/layout/KpiTabs';

export function KpiLayout() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-xevn-text">
            Quản trị KPI
          </h1>
          <p className="mt-1 text-sm text-xevn-muted">
            Quản lý khai báo KPI, gán KPI theo phạm vi tổ chức, phân bổ KPI cá nhân và theo dõi tiến độ theo kỳ.
          </p>
        </div>
        <KpiTabs />
      </div>

      <Outlet />
    </div>
  );
}

