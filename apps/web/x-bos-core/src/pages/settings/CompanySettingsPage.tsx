// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Màn hình: XBOS Settings > Quản lý Công ty & Tenant

import { useEffect, useReducer, useState, useCallback } from 'react';
import { Building2, Plus, RefreshCcw, AlertCircle } from 'lucide-react';
import {
  listSettingsCompanies,
  createSettingsCompany,
  activateTenant,
  suspendTenant,
  type XbosCompanyRow,
  type CreateCompanyPayload,
  type TenantKind,
  type TenantModule,
} from '@/integrations/xbosApi';
import { CompanyStatusBadge } from '@/components/settings/CompanyStatusBadge';
import { TenantModuleBadge } from '@/components/settings/TenantModuleBadge';
import { resolveIndustryLabel } from '@/lib/industryDictionary';
import { AddCompanyDialog } from '@/components/settings/AddCompanyDialog';
import { SuspendConfirmDialog } from '@/components/settings/SuspendConfirmDialog';

// ─── State types ─────────────────────────────────────────────────────────────

type PageState = {
  items: XbosCompanyRow[];
  loading: boolean;
  error: string | null;
  actionPending: string | null; // tenantId of in-flight action
  toastMessage: string | null;
};

type PageAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; items: XbosCompanyRow[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'ACTION_START'; tenantId: string }
  | { type: 'ROW_UPDATED'; row: XbosCompanyRow }
  | { type: 'ROW_ADDED'; row: XbosCompanyRow }
  | { type: 'ACTION_END' }
  | { type: 'TOAST'; message: string }
  | { type: 'TOAST_CLEAR' };

function reducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.items };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'ACTION_START':
      return { ...state, actionPending: action.tenantId };
    case 'ROW_UPDATED':
      return {
        ...state,
        actionPending: null,
        items: state.items.map((r) => (r.tenantId === action.row.tenantId ? action.row : r)),
      };
    case 'ROW_ADDED':
      return { ...state, items: [action.row, ...state.items] };
    case 'ACTION_END':
      return { ...state, actionPending: null };
    case 'TOAST':
      return { ...state, toastMessage: action.message };
    case 'TOAST_CLEAR':
      return { ...state, toastMessage: null };
    default:
      return state;
  }
}

const INITIAL_STATE: PageState = {
  items: [],
  loading: false,
  error: null,
  actionPending: null,
  toastMessage: null,
};

// ─── Mock data (hiển thị khi API offline) ───────────────────────────────────

const MOCK_ITEMS: XbosCompanyRow[] = [
  {
    tenantId: 'xevn',
    name: 'XeVN Group Holding',
    shortName: 'XeVN',
    tenantKind: 'master',
    defaultCompanyId: 'holding',
    modules: ['hrm', 'logistics'],
    status: 'active',
    legalEntity: { code: 'XGH', taxCode: '0100000000', businessLines: 'Đầu tư tài chính' },
  industry: 'Đầu tư tài chính',
  },
  {
    tenantId: 'xe-du-lich',
    name: 'XeVN Du Lịch',
    shortName: 'XeVN DL',
    tenantKind: 'member',
    defaultCompanyId: 'du-lich',
    modules: ['hrm'],
    status: 'provisioning',
    legalEntity: { code: 'XDL', taxCode: '0123456789', businessLines: 'Du lịch và lữ hành' },
  },
];

// ─── Page component ──────────────────────────────────────────────────────────

export function CompanySettingsPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<XbosCompanyRow | null>(null);

  const fetchCompanies = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await listSettingsCompanies();
      dispatch({ type: 'FETCH_SUCCESS', items: data.items });
    } catch {
      // Khi API offline, dùng mock data để preview UI
      dispatch({ type: 'FETCH_SUCCESS', items: MOCK_ITEMS });
    }
  }, []);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  // Auto-clear toast sau 4 giây
  useEffect(() => {
    if (!state.toastMessage) return;
    const id = window.setTimeout(() => dispatch({ type: 'TOAST_CLEAR' }), 4000);
    return () => window.clearTimeout(id);
  }, [state.toastMessage]);

  const handleActivate = useCallback(async (row: XbosCompanyRow) => {
    dispatch({ type: 'ACTION_START', tenantId: row.tenantId });
    try {
      const updated = await activateTenant(row.tenantId);
      dispatch({ type: 'ROW_UPDATED', row: updated });
      dispatch({
        type: 'TOAST',
        message: `Đã kích hoạt "${row.name}" — HRM/Logistics sẽ nhận cấu hình trong ít phút.`,
      });
    } catch (err) {
      dispatch({ type: 'ACTION_END' });
      dispatch({
        type: 'TOAST',
        message: err instanceof Error ? err.message : 'Kích hoạt thất bại.',
      });
    }
  }, []);

  const handleSuspendConfirm = useCallback(async () => {
    if (!suspendTarget) return;
    const target = suspendTarget;
    setSuspendTarget(null);
    dispatch({ type: 'ACTION_START', tenantId: target.tenantId });
    try {
      const updated = await suspendTenant(target.tenantId);
      dispatch({ type: 'ROW_UPDATED', row: updated });
      dispatch({ type: 'TOAST', message: `Đã tạm ngưng "${target.name}".` });
    } catch (err) {
      dispatch({ type: 'ACTION_END' });
      dispatch({
        type: 'TOAST',
        message: err instanceof Error ? err.message : 'Tạm ngưng thất bại.',
      });
    }
  }, [suspendTarget]);

  const handleCreateCompany = useCallback(async (payload: CreateCompanyPayload) => {
    const created = await createSettingsCompany(payload);
    dispatch({ type: 'ROW_ADDED', row: created });
    dispatch({ type: 'TOAST', message: `Đã thêm "${created.name}" — trạng thái: Đang cấp phép.` });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-xevn-text">
            Quản lý Công ty &amp; Tenant
          </h1>
          <p className="mt-1 text-sm text-xevn-muted">
            Khai báo và kích hoạt các công ty thành viên. Sau khi kích hoạt, HRM và Logistics sẽ nhận cấu hình tự động.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void fetchCompanies()}
            disabled={state.loading}
            className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white/60 px-3 py-2 text-sm font-medium text-xevn-text hover:bg-white/90 disabled:opacity-50"
            aria-label="Tải lại danh sách"
          >
            <RefreshCcw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setAddDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2 text-sm font-medium text-white shadow-md shadow-xevn-primary/25 hover:bg-xevn-accent"
          >
            <Plus className="h-4 w-4" />
            Thêm công ty mới
          </button>
        </div>
      </div>

      {/* Error banner */}
      {state.error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* Table card */}
      <div className="rounded-xl bg-white/85 shadow-soft backdrop-blur-sm border border-black/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] bg-white/70 backdrop-blur-md text-xs uppercase text-xevn-muted">
                <th className="px-4 py-3">Tên công ty</th>
                <th className="px-4 py-3">Mã tenant</th>
                <th className="px-4 py-3">Phân hệ</th>
                <th className="px-4 py-3">Ngành nghề</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {state.loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xevn-muted text-sm">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!state.loading && state.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xevn-muted text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-8 w-8 opacity-30" />
                      <span>Chưa có công ty nào. Nhấn &ldquo;Thêm công ty mới&rdquo; để bắt đầu.</span>
                    </div>
                  </td>
                </tr>
              )}
              {!state.loading &&
                state.items.map((row) => (
                  <CompanyRow
                    key={row.tenantId}
                    row={row}
                    actionPending={state.actionPending === row.tenantId}
                    onActivate={handleActivate}
                    onSuspend={setSuspendTarget}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      {addDialogOpen && (
        <AddCompanyDialog
          onClose={() => setAddDialogOpen(false)}
          onCreate={handleCreateCompany}
        />
      )}

      {suspendTarget && (
        <SuspendConfirmDialog
          companyName={suspendTarget.name}
          onConfirm={handleSuspendConfirm}
          onCancel={() => setSuspendTarget(null)}
        />
      )}

      {/* Toast notification */}
      {state.toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl bg-xevn-text px-4 py-3 text-sm text-white shadow-lg">
          {state.toastMessage}
        </div>
      )}
    </div>
  );
}

// ─── Table row ───────────────────────────────────────────────────────────────

type CompanyRowProps = {
  row: XbosCompanyRow;
  actionPending: boolean;
  onActivate: (row: XbosCompanyRow) => void;
  onSuspend: (row: XbosCompanyRow) => void;
};

function CompanyRow({ row, actionPending, onActivate, onSuspend }: CompanyRowProps) {
  const kindLabel: Record<TenantKind, string> = {
    master: 'Chủ sở hữu',
    member: 'Thành viên',
  };

  return (
    <tr className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02] transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-xevn-text">{row.name}</div>
        {row.shortName && <div className="text-xs text-xevn-muted">{row.shortName}</div>}
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-xevn-text/80">{row.tenantId}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {row.modules.map((mod) => (
            <TenantModuleBadge key={mod} module={mod} />
          ))}
          {row.modules.length === 0 && <span className="text-xs text-xevn-muted">—</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-xevn-text/80">
        {resolveIndustryLabel(row.legalEntity?.businessLines ?? row.industry) ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-xevn-text/80">
        {kindLabel[row.tenantKind] ?? row.tenantKind}
      </td>
      <td className="px-4 py-3">
        <CompanyStatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {row.status === 'provisioning' && (
            <button
              type="button"
              disabled={actionPending}
              onClick={() => void onActivate(row)}
              className="rounded-lg border border-xevn-primary/30 bg-xevn-primary/10 px-3 py-1.5 text-xs font-medium text-xevn-primary hover:bg-xevn-primary/20 disabled:opacity-50"
            >
              {actionPending ? 'Đang xử lý...' : 'Kích hoạt'}
            </button>
          )}
          {row.status === 'active' && (
            <button
              type="button"
              disabled={actionPending}
              onClick={() => onSuspend(row)}
              className="rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
            >
              {actionPending ? 'Đang xử lý...' : 'Tạm ngưng'}
            </button>
          )}
          {(row.status === 'suspended' || row.status === 'archived') && (
            <span className="text-xs text-xevn-muted">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}

// Re-export for downstream use
export type { TenantModule };
