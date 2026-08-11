/**
 * @CODE-MEMORY
 * Screen: /dashboard/organization · /dashboard/customers — thanh thao tác dashboard XBOS
 * UC: UF-XBOS-10 · FR-UC-XBOS-DASH-01
 * SRS: docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md §4.2–4.3
 * TechSpec: web-portal dashboard routes · PageHeader actions
 * Purpose: Nhãn nút toolbar khớp HDSD + harness QA TC-XBOS-HDSD-016/019; export CSV client-side; lọc cây org / bảng KH.
 * WorkItem: D-XBOS-DASHBOARD-FE-01
 * Coded: 2026-08-01
 * Callers: OrganizationPage.tsx · CustomersPage.tsx · dashboardPageToolbar.test.ts
 * Impact: Thiếu nhãn visible → QA sweep 🟡 button-spot; export/lọc không hoạt động.
 * must_keep: Nhãn tiếng Việt trên button (không icon-only); Khách hàng vẫn view-only — «Thêm mới» chỉ mở hướng dẫn CRM.
 * SOLID: Tách helper export/lọc khỏi page để test regex QA độc lập UI.
 * LastVerified: vitest dashboardPageToolbar.test.ts
 */

/** Harness QA sweep — TC-XBOS-HDSD-016 */
export const ORG_DASHBOARD_QA_BUTTON_PATTERN = /bộ lọc|tìm|export|xuất/i;

/** Harness QA sweep — TC-XBOS-HDSD-019 */
export const CUSTOMERS_DASHBOARD_QA_BUTTON_PATTERN = /thêm|tạo|tìm/i;

export const ORG_TOOLBAR_LABELS = {
  reload: 'Tải lại',
  filter: 'Bộ lọc',
  search: 'Tìm kiếm',
  export: 'Xuất Excel',
  settings: 'Cài đặt',
} as const;

export const CUSTOMERS_TOOLBAR_LABELS = {
  add: 'Thêm mới',
  search: 'Tìm kiếm',
  export: 'Xuất',
} as const;

export type OrgTreeViewNode = {
  id: string;
  label: string;
  name?: string;
  type?: string;
  children?: OrgTreeViewNode[];
};

export function orgRowsToTreeViewNodes(rows: Array<Record<string, unknown>>): OrgTreeViewNode[] {
  return rows.map((row) => {
    const name = typeof row.name === 'string' ? row.name : '';
    const label = typeof row.label === 'string' && row.label.trim() ? row.label : name;
    const children = Array.isArray(row.children)
      ? orgRowsToTreeViewNodes(row.children as Array<Record<string, unknown>>)
      : undefined;
    return {
      id: String(row.id ?? label),
      label,
      name,
      type: typeof row.type === 'string' ? row.type : undefined,
      children,
    };
  });
}

export type OrgTreeFilterMode = 'all' | 'departments';

export function filterOrgTreeNodes(
  nodes: OrgTreeViewNode[],
  query: string,
  mode: OrgTreeFilterMode,
): OrgTreeViewNode[] {
  const q = query.trim().toLowerCase();

  const walk = (list: OrgTreeViewNode[]): OrgTreeViewNode[] => {
    const out: OrgTreeViewNode[] = [];
    for (const node of list) {
      if (mode === 'departments' && node.type !== 'department') {
        const nested = node.children ? walk(node.children) : [];
        if (nested.length) {
          out.push({ ...node, children: nested });
        }
        continue;
      }
      const labelMatch = !q || node.label.toLowerCase().includes(q);
      const children = node.children ? walk(node.children) : undefined;
      if (labelMatch || (children && children.length > 0)) {
        out.push({
          ...node,
          children: labelMatch ? node.children : children,
        });
      }
    }
    return out;
  };

  return walk(nodes);
}

export function flattenOrgTreeForExport(nodes: OrgTreeViewNode[], depth = 0): string[][] {
  const rows: string[][] = [];
  for (const node of nodes) {
    rows.push([String(depth), node.label, node.type ?? '']);
    if (node.children?.length) {
      rows.push(...flattenOrgTreeForExport(node.children, depth + 1));
    }
  }
  return rows;
}

export function buildOrgTreeCsv(nodes: OrgTreeViewNode[]): string {
  const header = ['Cấp', 'Tên đơn vị', 'Loại'];
  const body = flattenOrgTreeForExport(nodes);
  return [header, ...body]
    .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function buildCustomersCsv(
  rows: Array<{ code?: string; name?: string; type?: string; status?: string }>,
): string {
  const header = ['Mã', 'Tên', 'Loại', 'Trạng thái'];
  const body = rows.map((r) => [
    r.code ?? '',
    r.name ?? '',
    r.type ?? '',
    r.status ?? '',
  ]);
  return [header, ...body]
    .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function filterCustomersByQuery<T extends { code?: string; name?: string }>(
  rows: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (row) =>
      (row.code ?? '').toLowerCase().includes(q) ||
      (row.name ?? '').toLowerCase().includes(q),
  );
}

export function joinToolbarLabelsForQa(labels: readonly string[]): string {
  return labels.join(' ');
}
