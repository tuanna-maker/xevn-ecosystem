import { describe, expect, it } from 'vitest';
import {
  EMBED_ANNOTATION_FORBIDDEN_SNIPPETS,
  looksLikeUuid,
  resolveEmbedDvtvLabel,
  resolveEmbedWorkingContext,
  resolveTenantDisplayLabelVi,
} from './embedWorkingContext';

describe('embedWorkingContext (BM-FE-ROLE-SWITCH-01 / BM-AC-02-01)', () => {
  it('group CEO OU selected → ĐVTV display name + role VI', () => {
    const ctx = resolveEmbedWorkingContext({
      showOuFilter: true,
      selectedSlug: 'trsport',
      selectedUnitDisplayNameVi: 'Khối Vận tải X.E',
      jwtTenantId: 'xevn',
      roleCode: 'group_ceo',
    });
    expect(ctx.dvtvLabel).toBe('Khối Vận tải X.E');
    expect(ctx.roleLabel).toBe('Tổng giám đốc tập đoàn');
  });

  it('group CEO rollup → Tất cả đơn vị + role VI', () => {
    const ctx = resolveEmbedWorkingContext({
      showOuFilter: true,
      selectedSlug: 'all',
      selectedUnitDisplayNameVi: null,
      jwtTenantId: 'xevn',
      roleCode: 'group_ceo',
    });
    expect(ctx.dvtvLabel).toBe('Tất cả đơn vị (rollup)');
    expect(ctx.roleLabel).toBe('Tổng giám đốc tập đoàn');
  });

  it('member CEO → tenant VI + subsidiary_ceo VI (no OU rollup)', () => {
    const ctx = resolveEmbedWorkingContext({
      showOuFilter: false,
      selectedSlug: 'all',
      selectedUnitDisplayNameVi: null,
      jwtTenantId: 'xe-du-lich',
      roleCode: 'subsidiary_ceo',
    });
    expect(ctx.dvtvLabel).toBe('Công ty TNHH Du lịch X.E Việt Nam');
    expect(ctx.roleLabel).toBe('TGĐ công ty thành viên');
  });

  it('never returns UUID-only ĐVTV label', () => {
    const uuid = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
    expect(looksLikeUuid(uuid)).toBe(true);
    expect(resolveTenantDisplayLabelVi(uuid)).toBe('Công ty thành viên');
    expect(resolveEmbedDvtvLabel({
      showOuFilter: false,
      selectedSlug: 'all',
      selectedUnitDisplayNameVi: null,
      jwtTenantId: uuid,
    })).not.toMatch(uuid);
  });

  it('compact labels never include annotation-strip chrome', () => {
    const samples = [
      resolveEmbedWorkingContext({
        showOuFilter: true,
        selectedSlug: 'all',
        selectedUnitDisplayNameVi: null,
        jwtTenantId: 'xevn',
        roleCode: 'group_ceo',
      }),
      resolveEmbedWorkingContext({
        showOuFilter: false,
        selectedSlug: 'all',
        selectedUnitDisplayNameVi: null,
        jwtTenantId: 'xe-du-lich',
        roleCode: 'subsidiary_ceo',
      }),
    ];
    for (const ctx of samples) {
      const blob = `${ctx.dvtvLabel} ${ctx.roleLabel}`;
      for (const forbidden of EMBED_ANNOTATION_FORBIDDEN_SNIPPETS) {
        expect(blob).not.toContain(forbidden);
      }
    }
  });
});
