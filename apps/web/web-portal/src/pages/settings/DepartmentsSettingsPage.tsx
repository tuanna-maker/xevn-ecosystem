import React from 'react';
import BusinessMasterSettingsPage, { type MasterRow } from './BusinessMasterSettingsPage';
import type { Column } from '../../components/common';
import { Badge } from '../../components/common';

const columns: Column<MasterRow>[] = [
  { key: 'code', header: 'Mã', render: (r) => <span className="font-mono text-sm">{r.code}</span> },
  { key: 'nameVi', header: 'Tên phòng ban', render: (r) => r.nameVi },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (r) => (
      <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>
        {r.status === 'active' ? 'Hoạt động' : 'Ngưng'}
      </Badge>
    ),
  },
];

const DepartmentsSettingsPage: React.FC = () => (
  <BusinessMasterSettingsPage
    title="Danh mục Phòng ban"
    subtitle="Master phòng ban (business-master · department_catalog)"
    domain="department_catalog"
    columns={columns}
    emptyLabel="Chưa có phòng ban. Chạy: pnpm seed:business-master:settings-md"
  />
);

export default DepartmentsSettingsPage;
