import { describe, expect, it } from 'vitest';
import {
  normalizeJdPackResolveResult,
  stripJdPackRulesForPut,
} from './jdPackClientNormalize';

describe('jdPackClientNormalize — PO-HRM-JD-DYNAMIC-FE-03', () => {
  describe('normalizeJdPackResolveResult (FE-RESOLVE-GROUPS-MAP)', () => {
    it('maps always_on_groups → groups when top-level groups absent', () => {
      const normalized = normalizeJdPackResolveResult({
        pack_code: 'PACK_CORP_DEFAULT',
        pack_label: 'Mặc định pháp nhân',
        resolved_from_rule_id: 'rule-1',
        always_on_groups: [
          {
            group_code: 'SEC_META',
            label: 'Meta',
            view_style: 'chips',
            sort_order: 0,
            always_on: true,
            fields: [
              {
                field_key: 'title',
                label: 'Chức danh',
                field_type: 'short_text',
                is_required: true,
                sort_order: 0,
              },
            ],
          },
          {
            group_code: 'SEC_RESPONSIBILITIES',
            label: 'Trách nhiệm',
            view_style: 'bullets',
            sort_order: 1,
            always_on: true,
            fields: [],
          },
        ],
      });

      expect(normalized.pack_code).toBe('PACK_CORP_DEFAULT');
      expect(normalized.groups).toHaveLength(2);
      expect(normalized.groups[0].group_code).toBe('SEC_META');
      expect(normalized.groups[0].source).toBe('pack_always_on');
      expect(normalized.groups[0].fields[0].field_key).toBe('title');
      expect(normalized.groups[1].group_code).toBe('SEC_RESPONSIBILITIES');
    });

    it('prefers always_on_groups over empty groups[]', () => {
      const normalized = normalizeJdPackResolveResult({
        pack_code: 'PACK_IT_OFFICE',
        groups: [],
        always_on_groups: [
          {
            group_code: 'SEC_META',
            label: 'Meta',
            view_style: 'heading',
            sort_order: 0,
            fields: [],
          },
        ],
      });
      expect(normalized.groups).toHaveLength(1);
      expect(normalized.groups[0].group_code).toBe('SEC_META');
    });

    it('falls back to groups when always_on_groups missing', () => {
      const normalized = normalizeJdPackResolveResult({
        pack_code: 'PACK_X',
        groups: [
          {
            group_code: 'SEC_A',
            label: 'A',
            view_style: 'heading',
            source: 'pack_always_on',
            sort_order: 0,
            fields: [],
          },
        ],
      });
      expect(normalized.groups).toHaveLength(1);
      expect(normalized.groups[0].group_code).toBe('SEC_A');
    });

    it('falls back to pack.groups always_on=true when both top arrays empty', () => {
      const normalized = normalizeJdPackResolveResult({
        pack_code: 'PACK_DRIVER_OPS',
        pack: {
          groups: [
            {
              group_code: 'SEC_LICENSE',
              label: 'GPLX',
              view_style: 'bullets',
              always_on: true,
              sort_order: 0,
              fields: [{ field_key: 'license', label: 'GPLX', field_type: 'short_text', sort_order: 0 }],
            },
            {
              group_code: 'SEC_OPTIONAL',
              label: 'Tuỳ chọn',
              view_style: 'heading',
              always_on: false,
              sort_order: 1,
              fields: [],
            },
          ],
        },
      });
      expect(normalized.groups.map((g) => g.group_code)).toEqual(['SEC_LICENSE']);
      expect(normalized.optional_groups.map((g) => g.group_code)).toEqual(['SEC_OPTIONAL']);
      expect(normalized.optional_groups[0].source).toBe('optional_dnd');
    });
  });

  describe('stripJdPackRulesForPut (FE-RULES-PUT-STRIP)', () => {
    it('keeps DTO fields and drops id/company_id/created_at/pack_label', () => {
      const stripped = stripJdPackRulesForPut([
        {
          id: 'uuid-rule-1',
          company_id: 'main',
          priority: 10,
          match_type: 'job_family',
          match_value: 'IT',
          pack_id: 'uuid-pack-1',
          pack_code: 'PACK_IT_OFFICE',
          pack_label: 'IT Office',
          condition_json: { note: 'keep' },
          is_active: true,
          created_at: '2026-08-01T00:00:00.000Z',
          updated_at: '2026-08-01T00:00:00.000Z',
        },
        {
          id: 'uuid-rule-2',
          company_id: 'main',
          priority: 100,
          match_type: 'fallback',
          match_value: null,
          pack_code: 'PACK_CORP_DEFAULT',
          pack_label: 'Default',
          is_active: true,
          created_at: '2026-08-01T00:00:00.000Z',
        },
      ]);

      expect(stripped).toEqual([
        {
          priority: 10,
          match_type: 'job_family',
          match_value: 'IT',
          pack_id: 'uuid-pack-1',
          pack_code: 'PACK_IT_OFFICE',
          condition_json: { note: 'keep' },
          is_active: true,
        },
        {
          priority: 100,
          match_type: 'fallback',
          match_value: null,
          pack_code: 'PACK_CORP_DEFAULT',
          is_active: true,
        },
      ]);

      for (const row of stripped) {
        expect(row).not.toHaveProperty('id');
        expect(row).not.toHaveProperty('company_id');
        expect(row).not.toHaveProperty('created_at');
        expect(row).not.toHaveProperty('updated_at');
        expect(row).not.toHaveProperty('pack_label');
      }
    });
  });
});
