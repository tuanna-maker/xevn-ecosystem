import { describe, expect, it } from 'vitest';
import {
  addOptionalGroup,
  buildSnapshotV2,
  ensureTitleFirst,
  mergePackOntoCanvas,
  orderGroupsForView,
  type JdSnapshotGroup,
} from './jdDynamicSnapshot';

const meta: JdSnapshotGroup = {
  group_code: 'SEC_META',
  label: 'Meta',
  view_style: 'chips',
  source: 'pack_always_on',
  sort_order: 0,
  fields: [
    { field_key: 'title', label: 'Chức danh', field_type: 'short_text', is_required: true, sort_order: 0 },
    { field_key: 'location', label: 'Địa điểm', field_type: 'short_text', sort_order: 1 },
  ],
};

const duties: JdSnapshotGroup = {
  group_code: 'SEC_RESPONSIBILITIES',
  label: 'Trách nhiệm',
  view_style: 'bullets',
  source: 'pack_always_on',
  sort_order: 1,
  fields: [
    { field_key: 'responsibilities', label: 'Mô tả', field_type: 'long_text', sort_order: 0 },
  ],
};

describe('jdDynamicSnapshot — PO-HRM-JD-DYNAMIC-FE-01', () => {
  it('ensureTitleFirst moves title group to hero', () => {
    const ordered = ensureTitleFirst([duties, meta]);
    expect(ordered[0].group_code).toBe('SEC_META');
    expect(ordered[0].fields[0].field_key).toBe('title');
  });

  it('buildSnapshotV2 sets layout_version 2 + pack', () => {
    const snap = buildSnapshotV2({
      pack_code: 'PACK_IT_OFFICE',
      pack_label: 'IT',
      groups: [meta, duties],
    });
    expect(snap.layout_version).toBe(2);
    expect(snap.pack_code).toBe('PACK_IT_OFFICE');
    expect(snap.groups.length).toBe(2);
  });

  it('orderGroupsForView sorts by sort_order only (no hardcode §3.6 codes)', () => {
    const view = orderGroupsForView([
      { ...duties, sort_order: 5 },
      { ...meta, sort_order: 1 },
    ]);
    expect(view.map((g) => g.group_code)).toEqual(['SEC_META', 'SEC_RESPONSIBILITIES']);
  });

  it('G4 mergePackOntoCanvas keeps overlapping values and detaches missing groups', () => {
    const optional: JdSnapshotGroup = {
      group_code: 'SEC_AI_TOOLS',
      label: 'AI',
      view_style: 'bullets',
      source: 'optional_dnd',
      sort_order: 2,
      fields: [{ field_key: 'ai_stack', label: 'AI', field_type: 'long_text', sort_order: 0 }],
    };
    const prevGroups = [meta, duties, optional];
    const prevValues = {
      title: 'Dev',
      responsibilities: 'Code',
      ai_stack: 'Copilot',
      location: 'HN',
    };
    const driverAlwaysOn: JdSnapshotGroup[] = [
      meta,
      {
        group_code: 'SEC_LICENSE',
        label: 'Giấy phép',
        view_style: 'bullets',
        source: 'pack_always_on',
        sort_order: 1,
        fields: [{ field_key: 'license', label: 'GPLX', field_type: 'short_text', sort_order: 0 }],
      },
    ];
    const { snapshot, values } = mergePackOntoCanvas({
      previousGroups: prevGroups,
      previousValues: prevValues,
      nextAlwaysOnGroups: driverAlwaysOn,
      pack_code: 'PACK_DRIVER_OPS',
      pack_label: 'Driver',
    });
    expect(snapshot.pack_code).toBe('PACK_DRIVER_OPS');
    expect(values.title).toBe('Dev');
    expect(values.location).toBe('HN');
    expect(values.ai_stack).toBe('Copilot');
    expect(snapshot.groups.some((g) => g.group_code === 'SEC_LICENSE')).toBe(true);
    const detachedDuties = snapshot.groups.find((g) => g.group_code === 'SEC_RESPONSIBILITIES');
    expect(detachedDuties?.source).toBe('detached');
    expect(values.responsibilities).toBe('Code');
  });

  it('addOptionalGroup marks source optional_dnd and dedupes', () => {
    const next = addOptionalGroup([meta], {
      group_code: 'SEC_GROWTH',
      label: 'Lộ trình',
      view_style: 'heading',
      source: 'optional_only',
      sort_order: 9,
      fields: [],
    });
    expect(next.some((g) => g.group_code === 'SEC_GROWTH' && g.source === 'optional_dnd')).toBe(
      true,
    );
    expect(addOptionalGroup(next, next[1]).length).toBe(next.length);
  });
});
