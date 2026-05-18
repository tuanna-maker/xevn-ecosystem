import React from 'react';
import BusinessMasterSettingsPage, { type MasterRow } from './BusinessMasterSettingsPage';
import type { Column } from '../../components/common';
import { Badge } from '../../components/common';

const columns: Column<MasterRow>[] = [
  { key: 'code', header: 'Mã vùng', render: (r) => <span className="font-mono text-sm">{r.code}</span> },
  { key: 'nameVi', header: 'Tên vùng', render: (r) => r.nameVi },
  { key: 'country', header: 'Quốc gia', render: (r) => r.country ?? 'VN' },
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

const RegionsSettingsPage: React.FC = () => (
  <BusinessMasterSettingsPage
    title="Vùng địa lý"
    subtitle="Danh mục vùng địa lý (business-master · geographic_regions)"
    domain="geographic_regions"
    columns={columns}
    emptyLabel="Chưa có vùng. Chạy: pnpm seed:business-master:settings-md"
  />
);

export default RegionsSettingsPage;
