import React, { useState } from 'react';
import type { Company } from '../../../../data/mock-data';
import { Card } from '../../../../components/common';
import { ENTITY_LEVEL_LABELS } from '../../../../data/mock-data';
import { getParentEntityLabel } from '../../entity-utils';

type TabKey = 'companies' | 'members' | 'departments' | 'subscription';

export const CompanyView: React.FC<{
  legalEntities: Company[];
  openHrmApp: (path: string) => void;
}> = ({ legalEntities, openHrmApp }) => {
  const [tab, setTab] = useState<TabKey>('companies');

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">Phòng/Ban & Công ty</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Tab management theo màn `Company` bên HRM.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openHrmApp('/hr/company')}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
            >
              Mở HRM (tham chiếu)
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: 'companies', label: 'Công ty' },
            { key: 'members', label: 'Thành viên' },
            { key: 'departments', label: 'Phòng ban' },
            { key: 'subscription', label: 'Gói' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as TabKey)}
              className={
                tab === t.key
                  ? 'rounded-lg bg-xevn-primary px-3 py-2 text-sm font-semibold text-white'
                  : 'rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm font-semibold text-xevn-text hover:bg-slate-50'
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {tab === 'companies' ? (
        <Card className="mt-4 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/70 backdrop-blur-md">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Mã</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Tên pháp nhân</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Cấp bậc</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trực thuộc</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {legalEntities.map((row) => (
                  <tr key={row.id} className="border-t border-xevn-border">
                    <td className="px-3 py-2 font-medium tabular-nums text-xevn-text">{row.code}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.entityLevel ? ENTITY_LEVEL_LABELS[row.entityLevel] : '—'}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {getParentEntityLabel(row.parentEntityId, legalEntities) || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={row.status === 'active' ? 'font-medium text-emerald-700' : 'text-slate-500'}>
                        {row.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="text-[15px] font-semibold text-xevn-primary hover:underline"
                        onClick={() => openHrmApp('/hr/company')}
                      >
                        Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'members' ? (
        <Card className="mt-4">
          <div className="text-sm font-semibold text-xevn-text">Thành viên công ty</div>
          <div className="mt-1 text-sm text-xevn-textSecondary">Danh sách thành viên + role (placeholder FE theo HRM).</div>
        </Card>
      ) : null}

      {tab === 'departments' ? (
        <Card className="mt-4">
          <div className="text-sm font-semibold text-xevn-text">Phòng ban</div>
          <div className="mt-1 text-sm text-xevn-textSecondary">Quản lý phòng ban (placeholder FE theo HRM).</div>
        </Card>
      ) : null}

      {tab === 'subscription' ? (
        <Card className="mt-4">
          <div className="text-sm font-semibold text-xevn-text">Gói dịch vụ</div>
          <div className="mt-1 text-sm text-xevn-textSecondary">Quota nhân sự, plan hiện tại, nâng cấp (placeholder FE).</div>
        </Card>
      ) : null}
    </>
  );
};

