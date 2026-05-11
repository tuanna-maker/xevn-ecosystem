import { Outlet } from 'react-router-dom';
import { PolicyTabs } from '@/components/layout/PolicyTabs';

export function PolicyLayout() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-xevn-text">
            Quản trị Global Policy & Incentive Engine
          </h1>
          <p className="mt-1 text-sm text-xevn-muted">
            Thiết lập chính sách khung của tập đoàn, cho phép override theo đơn vị, cấu hình mapping thưởng/phạt theo KPI, và quét đề xuất để phê duyệt trước khi thi hành.
          </p>
        </div>
        <PolicyTabs />
      </div>

      <Outlet />
    </div>
  );
}

