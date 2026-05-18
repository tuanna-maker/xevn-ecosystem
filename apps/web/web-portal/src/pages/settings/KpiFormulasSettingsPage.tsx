import React from 'react';
import BusinessMasterSettingsPage, { type MasterRow } from './BusinessMasterSettingsPage';
import type { Column } from '../../components/common';
import { Badge } from '../../components/common';

const columns: Column<MasterRow>[] = [
  { key: 'code', header: 'Mã CT', render: (r) => <span className="font-mono text-sm">{r.code}</span> },
  { key: 'nameVi', header: 'Tên công thức', render: (r) => r.nameVi },
  {
    key: 'expression',
    header: 'Biểu thức',
    render: (r) => <span className="font-mono text-xs text-slate-600">{r.expression ?? '—'}</span>,
  },
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

const KpiFormulasSettingsPage: React.FC = () => (
  <BusinessMasterSettingsPage
    title="Công thức KPI"
    subtitle="Công thức tính KPI (business-master · kpi_formulas)"
    domain="kpi_formulas"
    columns={columns}
    emptyLabel="Chưa có công thức. Chạy: pnpm seed:business-master:settings-md"
  />
);

export default KpiFormulasSettingsPage;
