import { describe, expect, it } from 'vitest';
import {
  CUSTOMERS_DASHBOARD_QA_BUTTON_PATTERN,
  CUSTOMERS_TOOLBAR_LABELS,
  ORG_DASHBOARD_QA_BUTTON_PATTERN,
  ORG_TOOLBAR_LABELS,
  buildCustomersCsv,
  buildOrgTreeCsv,
  filterCustomersByQuery,
  filterOrgTreeNodes,
  joinToolbarLabelsForQa,
  orgRowsToTreeViewNodes,
} from './dashboardPageToolbar';

describe('dashboardPageToolbar — QA harness labels', () => {
  it('TC-XBOS-HDSD-016 org toolbar matches sweep regex', () => {
    const text = joinToolbarLabelsForQa(Object.values(ORG_TOOLBAR_LABELS));
    expect(ORG_DASHBOARD_QA_BUTTON_PATTERN.test(text)).toBe(true);
  });

  it('TC-XBOS-HDSD-019 customers toolbar matches sweep regex', () => {
    const text = joinToolbarLabelsForQa(Object.values(CUSTOMERS_TOOLBAR_LABELS));
    expect(CUSTOMERS_DASHBOARD_QA_BUTTON_PATTERN.test(text)).toBe(true);
  });
});

describe('dashboardPageToolbar — org tree helpers', () => {
  const sample = orgRowsToTreeViewNodes([
    {
      id: 'c1',
      name: 'XeVN Holding',
      type: 'company',
      children: [{ id: 'd1', name: 'Phòng Kinh doanh', type: 'department', children: [] }],
    },
  ]);

  it('maps name to label for TreeView', () => {
    expect(sample[0]?.label).toBe('XeVN Holding');
    expect(sample[0]?.children?.[0]?.label).toBe('Phòng Kinh doanh');
  });

  it('filters by search query', () => {
    const filtered = filterOrgTreeNodes(sample, 'kinh doanh', 'all');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.children?.[0]?.label).toBe('Phòng Kinh doanh');
  });

  it('exports CSV with header', () => {
    const csv = buildOrgTreeCsv(sample);
    expect(csv).toContain('Tên đơn vị');
    expect(csv).toContain('XeVN Holding');
  });
});

describe('dashboardPageToolbar — customers helpers', () => {
  const rows = [
    { code: 'KH-001', name: 'Công ty ABC', type: 'corporate', status: 'active' },
    { code: 'KH-002', name: 'Nguyễn Văn A', type: 'individual', status: 'active' },
  ];

  it('filters customers by code or name', () => {
    expect(filterCustomersByQuery(rows, 'abc')).toHaveLength(1);
    expect(filterCustomersByQuery(rows, 'kh-002')).toHaveLength(1);
  });

  it('builds customers CSV', () => {
    const csv = buildCustomersCsv(rows);
    expect(csv).toContain('Công ty ABC');
    expect(csv).toContain('Mã');
  });
});
