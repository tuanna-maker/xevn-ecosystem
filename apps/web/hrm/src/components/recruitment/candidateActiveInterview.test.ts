import { describe, expect, it } from 'vitest';
import {
  buildActiveInterviewByEmailMap,
  getActiveInterviewId,
  getCandidateActiveInterviewBadge,
  mergeActiveInterviewOntoPoolCandidates,
  pickActiveInterviewIdFrom409Details,
} from './candidateActiveInterview';

describe('getCandidateActiveInterviewBadge', () => {
  it('uses BE display-ready label + vi-VN time when present', () => {
    const badge = getCandidateActiveInterviewBadge({
      active_interview: {
        has_active_interview: true,
        active_interview_badge_label: 'Đã có lịch',
        active_interview_display_time_vi_vn: '06/08/2026 16:30',
      },
    });
    expect(badge).toEqual({ label: 'Đã có lịch', time: '06/08/2026 16:30' });
  });

  it('falls back to ISO → dd/MM/yyyy HH:mm when display_time invalid', () => {
    const badge = getCandidateActiveInterviewBadge({
      active_interview: {
        has_active_interview: true,
        active_interview_display_time_vi_vn: '2026-08-06 16:30',
        active_interview_at: '2026-08-06T09:30:00.000Z',
      },
    });
    expect(badge?.label).toBe('Đã có lịch');
    expect(badge?.time).toMatch(/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/);
  });

  it('returns em-dash when ISO invalid', () => {
    const badge = getCandidateActiveInterviewBadge({
      active_interview: {
        has_active_interview: true,
        active_interview_display_time_vi_vn: null,
        active_interview_at: 'invalid-date',
      },
    });
    expect(badge?.time).toBe('—');
  });

  it('returns null when no active interview', () => {
    expect(
      getCandidateActiveInterviewBadge({
        has_active_interview: false,
        active_interview_at: '2026-08-06T09:30:00.000Z',
      }),
    ).toBeNull();
  });

  it('merges Lane A active_interview onto pool rows by email', () => {
    const merged = mergeActiveInterviewOntoPoolCandidates(
      [
        { id: 'p1', email: 'uv@xe.vn' },
        { id: 'p2', email: 'other@xe.vn' },
      ],
      [
        {
          email: 'uv@xe.vn',
          active_interview: {
            has_active_interview: true,
            active_interview_id: 'iv-1',
            active_interview_badge_label: 'Đã có lịch',
            active_interview_display_time_vi_vn: '07/08/2026 09:00',
          },
        },
      ],
    );
    expect(merged[0]?.active_interview?.has_active_interview).toBe(true);
    expect(merged[0]?.active_interview?.active_interview_id).toBe('iv-1');
    expect(merged[1]?.active_interview).toBeUndefined();
    const map = buildActiveInterviewByEmailMap([
      {
        email: 'uv@xe.vn',
        active_interview: {
          has_active_interview: true,
          active_interview_badge_label: 'Đã có lịch',
        },
      },
    ]);
    expect(map.get('uv@xe.vn')?.active_interview_badge_label).toBe('Đã có lịch');
  });

  it('picks active_interview_id from nested or flat projection', () => {
    expect(
      getActiveInterviewId({
        active_interview: { has_active_interview: true, active_interview_id: 'iv-nested' },
      }),
    ).toBe('iv-nested');
    expect(
      getActiveInterviewId({
        active_interview_id: 'iv-flat',
        has_active_interview: true,
      }),
    ).toBe('iv-flat');
  });

  it('extracts active_interview_id from 409 details', () => {
    expect(pickActiveInterviewIdFrom409Details({ active_interview_id: 'iv-409' })).toBe('iv-409');
    expect(pickActiveInterviewIdFrom409Details(null)).toBeNull();
  });
});
