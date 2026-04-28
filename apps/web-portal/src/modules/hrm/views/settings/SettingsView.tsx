import React, { useState } from 'react';
import { Card } from '../../../../components/common';

type TabKey = 'account' | 'branding' | 'notifications' | 'security' | 'roles' | 'system' | 'subscription';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'account', label: 'Tài khoản' },
  { key: 'branding', label: 'Branding' },
  { key: 'notifications', label: 'Thông báo' },
  { key: 'security', label: 'Bảo mật' },
  { key: 'roles', label: 'Vai trò & phân quyền' },
  { key: 'system', label: 'Hệ thống' },
  { key: 'subscription', label: 'Gói dịch vụ' },
];

export const SettingsView: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('account');

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">Cấu hình HRM</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Bố cục tab theo màn `Settings` bên HRM.</div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
          >
            Lưu thay đổi
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
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

      {tab === 'account' ? (
        <Card className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">Họ và tên</div>
              <input className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20" defaultValue="Admin" />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">Email</div>
              <input className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20" defaultValue="admin@company.vn" />
            </label>
          </div>
        </Card>
      ) : null}

      {tab === 'branding' ? (
        <Card className="mt-4">
          <div className="text-sm font-semibold text-xevn-text">Branding</div>
          <div className="mt-1 text-sm text-xevn-textSecondary">Logo, màu chủ đạo, tên hiển thị (sẽ map sang cấu hình portal).</div>
        </Card>
      ) : null}

      {tab === 'notifications' ? (
        <Card className="mt-4">
          <div className="text-sm font-semibold text-xevn-text">Thông báo</div>
          <div className="mt-1 text-sm text-xevn-textSecondary">Email/Leave/Recruitment/Payroll/Attendance… (theo màn HRM).</div>
        </Card>
      ) : null}

      {tab === 'security' ? (
        <Card className="mt-4">
          <div className="text-sm font-semibold text-xevn-text">Bảo mật</div>
          <div className="mt-1 text-sm text-xevn-textSecondary">Đổi mật khẩu, key/2FA (placeholder FE).</div>
        </Card>
      ) : null}

      {tab === 'roles' ? (
        <Card className="mt-4">
          <div className="text-sm font-semibold text-xevn-text">Vai trò & phân quyền</div>
          <div className="mt-1 text-sm text-xevn-textSecondary">Bảng phân quyền theo module (placeholder FE).</div>
        </Card>
      ) : null}

      {tab === 'system' ? (
        <Card className="mt-4">
          <div className="text-sm font-semibold text-xevn-text">Hệ thống</div>
          <div className="mt-1 text-sm text-xevn-textSecondary">Ngôn ngữ / tiền tệ / cấu hình chung (placeholder FE).</div>
        </Card>
      ) : null}

      {tab === 'subscription' ? (
        <Card className="mt-4">
          <div className="text-sm font-semibold text-xevn-text">Gói dịch vụ</div>
          <div className="mt-1 text-sm text-xevn-textSecondary">Quota nhân sự + nâng cấp (placeholder FE).</div>
        </Card>
      ) : null}
    </>
  );
};

