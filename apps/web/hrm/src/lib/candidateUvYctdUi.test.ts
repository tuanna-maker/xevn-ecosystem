import { describe, expect, it } from 'vitest';
import {
  buildCandidateCreateWithYctdPayload,
  deriveUvPositionFromYctd,
  filterReceivableRequisitions,
  formatYctdOptionLabel,
  hasCandidateYctdLink,
  isReceivableRequisitionStatus,
  isUvCreateSubmitBlocked,
  mergeYctdDisplayOntoPoolCandidates,
  normalizeRequisitionId,
  parseRequisitionIdFromSearch,
  projectSpineCandidateToListRow,
  resolveCandidatePipelineStage,
  resolveCandidatePositionLabel,
  resolveCandidateYctdLabel,
  unionSpineOnlyCandidatesIntoList,
  UV_YCTD_NONE_SENTINEL,
  UV_YCTD_REQUIRED_VI,
} from './candidateUvYctdUi';

describe('candidateUvYctdUi — PO-HRM-REC-UV-YCTD-FE-01', () => {
  it('filters receivable statuses only (UT-REC-UV-01 FE thin)', () => {
    const rows = [
      { id: '1', status: 'open' },
      { id: '2', status: 'closed' },
      { id: '3', status: 'on_hold' },
      { id: '4', status: 'approved' },
      { id: '5', status: 'draft' },
      { id: '6', status: 'open_for_hire' },
    ];
    expect(filterReceivableRequisitions(rows).map((r) => r.id)).toEqual(['1', '4', '6']);
    expect(isReceivableRequisitionStatus('open')).toBe(true);
    expect(isReceivableRequisitionStatus('closed')).toBe(false);
  });

  it('derives position from YCTD display-ready — never free_text source', () => {
    const pos = deriveUvPositionFromYctd({
      id: 'req-1',
      title: 'Tuyển lái xe',
      status: 'open',
      position_key: 'LX-01',
      position_name: 'Lái xe container',
    });
    expect(pos).toEqual({
      recruitment_request_id: 'req-1',
      position_key: 'LX-01',
      position_name: 'Lái xe container',
      source: 'yctd',
    });
  });

  it('falls back position_name to jd_title/title when key-only display', () => {
    const pos = deriveUvPositionFromYctd({
      id: 'req-2',
      title: 'YCTD Kho',
      status: 'open',
      jd_title: 'Nhân viên kho',
      position_key: '',
      position_name: null,
    });
    expect(pos?.position_name).toBe('Nhân viên kho');
    expect(pos?.source).toBe('yctd');
  });

  it('buildCandidateCreateWithYctdPayload requires YCTD and omits free-text position', () => {
    expect(() =>
      buildCandidateCreateWithYctdPayload({
        company_id: 'c1',
        full_name: 'A',
        email: 'a@xe.vn',
        requisition_id: '',
      }),
    ).toThrow(UV_YCTD_REQUIRED_VI);

    const body = buildCandidateCreateWithYctdPayload({
      company_id: 'c1',
      full_name: 'Nguyễn Văn A',
      email: 'a@xe.vn',
      phone: '090',
      source: 'TopCV',
      stage: 'applied',
      requisition_id: 'req-9',
      position_key: 'LX-01',
    });
    expect(body.requisition_id).toBe('req-9');
    expect(body.position_key).toBe('LX-01');
    expect(Object.prototype.hasOwnProperty.call(body, 'position')).toBe(false);
  });

  it('rejects __none__ sentinel as requisition id', () => {
    expect(normalizeRequisitionId(UV_YCTD_NONE_SENTINEL)).toBe('');
    expect(isUvCreateSubmitBlocked({ isCreate: true, requisitionId: UV_YCTD_NONE_SENTINEL, receivableCount: 2 })).toBe(
      true,
    );
    expect(isUvCreateSubmitBlocked({ isCreate: true, requisitionId: 'req-1', receivableCount: 1 })).toBe(false);
    expect(isUvCreateSubmitBlocked({ isCreate: true, requisitionId: 'req-1', receivableCount: 0 })).toBe(true);
  });

  it('parses context ?requisition_id= for AC-REC-UV-04', () => {
    expect(parseRequisitionIdFromSearch('?tab=candidates&requisition_id=abc-1')).toBe('abc-1');
    expect(parseRequisitionIdFromSearch('recruitment_request_id=xyz')).toBe('xyz');
    expect(parseRequisitionIdFromSearch('?tab=candidates')).toBe('');
  });

  it('merges spine YCTD+position onto pool by email (AC-02 F5 display)', () => {
    const merged = mergeYctdDisplayOntoPoolCandidates(
      [{ id: 'p1', email: 'A@Xe.Vn', full_name: 'A', stage: 'new' }],
      [
        {
          id: 's1',
          email: 'a@xe.vn',
          status: 'offer',
          requisition_id: 'req-7',
          yctd_title: 'Tuyển NV',
          position_key: 'NV-01',
          position_name: 'Nhân viên',
          position_source: 'yctd',
        },
      ],
    );
    expect(merged[0].requisition_id).toBe('req-7');
    expect(merged[0].position_name).toBe('Nhân viên');
    expect(merged[0].stage).toBe('offer');
    expect(merged[0].status).toBe('offer');
    expect(resolveCandidatePipelineStage(merged[0])).toBe('offer');
    expect(resolveCandidatePositionLabel(merged[0])).toBe('Nhân viên');
    expect(resolveCandidateYctdLabel(merged[0])).toBe('Tuyển NV');
    expect(hasCandidateYctdLink(merged[0])).toBe(true);
  });

  it('formats picker label with code + position', () => {
    expect(
      formatYctdOptionLabel({
        id: '1',
        title: 'Tuyển lái xe',
        status: 'open',
        code: 'YCTD-01',
        position_name: 'Lái xe',
      }),
    ).toBe('YCTD-01 — Tuyển lái xe · Lái xe');
  });
});

describe('candidateUvYctdUi — PO-HRM-REC-UV-YCTD-FE-02 union spine-only', () => {
  const spineOnlyCreate = {
    id: '52442fa0-5565-40ad-97be-448c4df28684',
    company_id: 'main',
    full_name: 'UV YCTD QA UVYCTD-HLMG9D',
    email: 'uv.yctd.qa@xe.vn',
    source: 'TopCV',
    status: 'new' as const,
    created_at: '2026-08-06T12:00:00.000Z',
    requisition_id: 'a702a898-req',
    yctd_title: 'YCTD JD-ref QA YCTDJD-HKZN8G',
    position_key: 'CEO',
    position_name: 'Tổng Giám đốc',
    position_source: 'yctd' as const,
  };

  it('projects spine row with YCTD+position and list_lane=spine', () => {
    const row = projectSpineCandidateToListRow(spineOnlyCreate);
    expect(row.list_lane).toBe('spine');
    expect(row.stage).toBe('applied');
    expect(resolveCandidateYctdLabel(row)).toBe('YCTD JD-ref QA YCTDJD-HKZN8G');
    expect(resolveCandidatePositionLabel(row)).toBe('Tổng Giám đốc');
    expect(hasCandidateYctdLink(row)).toBe(true);
  });

  it('unions spine-only Lane A create into list when pool has 0 match (AC-REC-UV-02)', () => {
    const pool = [{ id: 'pool-1', email: 'other@xe.vn', full_name: 'Pool NV' }];
    const list = unionSpineOnlyCandidatesIntoList(pool, [spineOnlyCreate]);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(spineOnlyCreate.id);
    const spineRow = list[0] as ReturnType<typeof projectSpineCandidateToListRow>;
    expect(spineRow.list_lane).toBe('spine');
    expect(resolveCandidateYctdLabel(spineRow)).toContain('YCTD JD-ref');
    expect(resolveCandidatePositionLabel(spineRow)).toBe('Tổng Giám đốc');
    expect(list[1].id).toBe('pool-1');
  });

  it('does not duplicate when pool already matches spine by email (merge path)', () => {
    const poolEnriched = mergeYctdDisplayOntoPoolCandidates(
      [{ id: 'pool-shared', email: 'uv.yctd.qa@xe.vn', full_name: 'UV' }],
      [spineOnlyCreate],
    );
    const list = unionSpineOnlyCandidatesIntoList(poolEnriched, [spineOnlyCreate]);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('pool-shared');
    expect(resolveCandidatePositionLabel(list[0])).toBe('Tổng Giám đốc');
  });

  it('does not duplicate when pool id equals spine id', () => {
    const pool = [{ id: spineOnlyCreate.id, email: 'different@xe.vn', full_name: 'X' }];
    const list = unionSpineOnlyCandidatesIntoList(pool, [spineOnlyCreate]);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(spineOnlyCreate.id);
  });

  it('projects spine status when pool stage=new would block offer CTA gate', () => {
    const merged = mergeYctdDisplayOntoPoolCandidates(
      [{ id: 'p1', email: 'a@xe.vn', full_name: 'A', stage: 'new', status: 'new' }],
      [
        {
          id: 's1',
          email: 'a@xe.vn',
          status: 'offer',
          requisition_id: 'req-7',
          position_key: 'NV-01',
        },
      ],
    );
    expect(merged[0].status).toBe('offer');
    expect(merged[0].stage).toBe('offer');
    expect(resolveCandidatePipelineStage(merged[0])).toBe('offer');
  });
});
