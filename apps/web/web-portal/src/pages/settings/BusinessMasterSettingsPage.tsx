import React, { useEffect, useState } from 'react';
import { Plus, X, Save, Settings2 } from 'lucide-react';
import { PageHeader, DataTable, Button, type Column } from '../../components/common';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import { useTenantScope } from '../../contexts/GlobalFilterContext';
import {
  deleteBusinessMasterItem,
  listBusinessMasterItems,
  upsertBusinessMasterItem,
} from '../../integrations/businessMasterApi';

export type MasterRow = {
  id: string;
  code: string;
  nameVi: string;
  description?: string;
  status: 'active' | 'inactive';
  country?: string;
  expression?: string;
  linkedMetricCodes?: string[];
};

type Props = {
  title: string;
  subtitle: string;
  domain: string;
  columns: Column<MasterRow>[];
  emptyLabel: string;
};

const BusinessMasterSettingsPage: React.FC<Props> = ({ title, subtitle, domain, columns, emptyLabel }) => {
  const { tenantId, companyId } = useTenantScope();
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRow | null>(null);
  const [form, setForm] = useState<MasterRow>({
    id: '',
    code: '',
    nameVi: '',
    description: '',
    status: 'active',
  });

  const load = () => {
    void listBusinessMasterItems<MasterRow>(domain, tenantId, companyId)
      .then((data) => {
        setRows(data);
        setLoadError(false);
      })
      .catch(() => {
        setRows([]);
        setLoadError(true);
      });
  };

  useEffect(() => {
    load();
  }, [tenantId, companyId, domain]);

  const openAdd = () => {
    setEditing(null);
    setForm({ id: `row-${Date.now()}`, code: '', nameVi: '', description: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (row: MasterRow) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const save = async () => {
    const { id, ...payload } = form;
    await upsertBusinessMasterItem(domain, id, payload, tenantId, companyId);
    setModalOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await deleteBusinessMasterItem(domain, id, tenantId, companyId);
    load();
  };

  const actionCol: Column<MasterRow> = {
    key: 'actions',
    header: '',
    render: (row) => (
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => openEdit(row)} className="text-blue-600 hover:underline text-sm">
          Sửa
        </button>
        <button type="button" onClick={() => void remove(row.id)} className="text-red-600 hover:underline text-sm">
          Xóa
        </button>
      </div>
    ),
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} icon={<Settings2 className="h-6 w-6 text-xevn-primary" />} />
      <ApiLoadBanner
        loadFailed={loadError}
        message={loadError ? `Không tải được ${domain}. Chạy pnpm dev:xbos-api và seed:business-master:settings-md.` : undefined}
      />
      <div className="mb-4 flex justify-end">
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm mới
        </Button>
      </div>
      <DataTable columns={[...columns, actionCol]} data={rows} emptyMessage={emptyLabel} />
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editing ? 'Chỉnh sửa' : 'Thêm mới'}</h3>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm">
                Mã
                <input
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                Tên
                <input
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={form.nameVi}
                  onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                Mô tả
                <input
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              {domain === 'geographic_regions' ? (
                <label className="block text-sm">
                  Quốc gia
                  <input
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={form.country ?? 'VN'}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </label>
              ) : null}
              {domain === 'kpi_formulas' ? (
                <label className="block text-sm">
                  Biểu thức
                  <input
                    className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm"
                    value={form.expression ?? ''}
                    onChange={(e) => setForm({ ...form, expression: e.target.value })}
                  />
                </label>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => void save()}>
                <Save className="h-4 w-4 mr-2" />
                Lưu
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BusinessMasterSettingsPage;
