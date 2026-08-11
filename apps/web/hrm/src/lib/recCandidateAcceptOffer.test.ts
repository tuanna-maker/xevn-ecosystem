/**
 * @CODE-MEMORY
 * Screen:     vitest — UC-BP-REC-07 accept-offer helpers
 * WorkItem:   PO-HRM-MVP-GD1-REC-07-CLUSTER-FE-01
 */
import { describe, expect, it } from 'vitest';
import {
  buildAcceptOfferPrefillSnapshot,
  formatAcceptOfferSuccessToast,
  formatHireExpectedStartVi,
  isOfferReadyStage,
  resolveApplicationIdForAcceptOffer,
  shouldShowAcceptOfferCta,
  REC_HIRE_SUCCESS_CREATED_VI,
  REC_HIRE_SUCCESS_IDEMPOTENT_VI,
} from '@/lib/recCandidateAcceptOffer';

describe('recCandidateAcceptOffer helpers', () => {
  const offerStage = [{ stageKey: 'offer', allowsAcceptOffer: false }];
  const flagged = [
    { stageKey: 'final', allowsAcceptOffer: true },
    { stageKey: 'screening' },
  ];

  it('resolves application neo from Lane A / recruitment_candidate_id', () => {
    expect(
      resolveApplicationIdForAcceptOffer({
        id: 'pool-1',
        recruitment_candidate_id: 'lane-a-99',
        list_lane: 'pool',
        requisition_id: 'req-1',
      }),
    ).toBe('lane-a-99');
    expect(
      resolveApplicationIdForAcceptOffer({
        id: 'spine-1',
        list_lane: 'spine',
        requisition_id: 'req-1',
      }),
    ).toBe('spine-1');
  });

  it('isOfferReadyStage — offer key or allowsAcceptOffer flag', () => {
    expect(isOfferReadyStage(offerStage, 'offer', 1)).toBe(true);
    expect(isOfferReadyStage(offerStage, 'interview', 1)).toBe(false);
    expect(isOfferReadyStage(flagged, 'final', 2)).toBe(true);
    expect(isOfferReadyStage([], 'offer', 0)).toBe(true);
    expect(isOfferReadyStage([], 'screening', 0)).toBe(false);
  });

  it('shouldShowAcceptOfferCta — YCTD + offer-ready or soft-linked', () => {
    const base = {
      id: 'c1',
      list_lane: 'spine' as const,
      requisition_id: 'req-1',
      stage: 'offer',
    };
    expect(shouldShowAcceptOfferCta(base, offerStage, 1)).toBe(true);
    expect(
      shouldShowAcceptOfferCta(
        { ...base, stage: 'new', status: 'offer', employee_id: null },
        offerStage,
        1,
      ),
    ).toBe(true);
    expect(
      shouldShowAcceptOfferCta({ ...base, stage: 'screening', employee_id: 'e1' }, offerStage, 1),
    ).toBe(true);
    expect(
      shouldShowAcceptOfferCta({ ...base, stage: 'screening', employee_id: null }, offerStage, 1),
    ).toBe(false);
    expect(
      shouldShowAcceptOfferCta({ id: 'p1', list_lane: 'pool', stage: 'offer' }, offerStage, 1),
    ).toBe(false);
  });

  it('buildAcceptOfferPrefillSnapshot — no invent empty name', () => {
    const snap = buildAcceptOfferPrefillSnapshot({
      id: 'c1',
      full_name: 'Nguyễn Văn A',
      email: 'a@xe.vn',
      phone: '0901',
      company_id: 'main',
      position_key: 'DRV',
      position_name: 'Tài xế',
      requisition_id: 'req-1',
      expected_start_date: '2026-09-01',
      yctd_code: 'YCTD-01',
      yctd_title: 'Tuyển tài xế',
    });
    expect(snap.full_name).toBe('Nguyễn Văn A');
    expect(snap.position_label).toBe('Tài xế');
    expect(snap.yctd_label).toContain('YCTD-01');
  });

  it('formatAcceptOfferSuccessToast + date VI', () => {
    expect(formatAcceptOfferSuccessToast('created')).toBe(REC_HIRE_SUCCESS_CREATED_VI);
    expect(formatAcceptOfferSuccessToast('idempotent')).toBe(REC_HIRE_SUCCESS_IDEMPOTENT_VI);
    expect(formatHireExpectedStartVi('2026-09-01')).toBe('01/09/2026');
    expect(formatHireExpectedStartVi(null)).toBe('—');
  });
});
