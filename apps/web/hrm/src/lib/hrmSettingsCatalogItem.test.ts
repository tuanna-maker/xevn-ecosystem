import { describe, expect, it } from 'vitest';
import { buildSettingsCatalogItemPayload } from './hrmSettingsCatalogItem';

describe('hrmSettingsCatalogItem', () => {
  it('builds POST /settings-catalogs/items body (UF-HRM-10)', () => {
    expect(
      buildSettingsCatalogItemPayload({
        companyId: 'main',
        catalogKey: 'Positions',
        code: 'qa_uf10',
        label: 'QA Chức danh',
      }),
    ).toEqual({
      company_id: 'main',
      category_key: 'positions',
      item_key: 'qa_uf10',
      item_name: 'QA Chức danh',
    });
  });

  it('includes status when soft-stop / ngưng (AC-SET-UI-03)', () => {
    expect(
      buildSettingsCatalogItemPayload({
        companyId: 'main',
        catalogKey: 'hr_decision_types',
        code: 'transfer',
        label: 'Điều động',
        status: 'draft',
      }),
    ).toMatchObject({
      category_key: 'hr_decision_types',
      item_key: 'transfer',
      status: 'draft',
    });
  });
});
