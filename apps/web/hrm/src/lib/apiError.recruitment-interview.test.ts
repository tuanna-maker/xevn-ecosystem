import { describe, expect, it } from 'vitest';
import { toErrorMessage } from '@/lib/apiError';

describe('toErrorMessage recruitment interview one-active conflict', () => {
  it('maps HRM-REC-IV-409-ACTIVE to friendly business message', () => {
    const msg = toErrorMessage(
      {
        code: 'HRM-REC-IV-409-ACTIVE',
        message: 'Ứng viên đã có lịch phỏng vấn đang hiệu lực',
        status: 409,
      },
      'Không thể tạo lịch phỏng vấn',
    );

    expect(msg).toContain('Ứng viên đã có lịch phỏng vấn đang hiệu lực');
    expect(msg).toContain('Hãy hủy hoặc đổi lịch');
  });

  it('maps STAGE-DISALLOW distinct from 409 ACTIVE (O5)', () => {
    const disallow = toErrorMessage(
      { code: 'HRM-REC-IV-400-STAGE-DISALLOW', message: 'raw', status: 400 },
      'fallback',
    );
    const active = toErrorMessage(
      { code: 'HRM-REC-IV-409-ACTIVE', message: 'raw', status: 409 },
      'fallback',
    );
    expect(disallow).toContain('không cho phép lên lịch');
    expect(disallow).not.toContain('Hãy hủy hoặc đổi lịch');
    expect(active).toContain('Hãy hủy hoặc đổi lịch');
    expect(active).not.toBe(disallow);
  });

  it('maps PAST-DATETIME and CANCEL-REASON distinct from ACTIVE/DISALLOW', () => {
    const past = toErrorMessage(
      { code: 'HRM-REC-IV-400-PAST-DATETIME', message: 'raw', status: 400 },
      'fallback',
    );
    const cancel = toErrorMessage(
      { code: 'HRM-REC-IV-400-CANCEL-REASON', message: 'raw', status: 400 },
      'fallback',
    );
    const invalid = toErrorMessage(
      { code: 'HRM-REC-IV-400-INVALID-TRANSITION', message: 'raw', status: 400 },
      'fallback',
    );
    expect(past).toContain('quá khứ');
    expect(cancel).toContain('lý do hủy');
    expect(invalid).toContain('Không thể chuyển trạng thái');
    expect(past).not.toContain('Hãy hủy hoặc đổi lịch');
    expect(cancel).not.toContain('không cho phép lên lịch');
  });

  it('maps HRM-REC-CMP-MAX-N and YCTD-MIX (PO-HRM-REC-UV-YCTD-CMP-FE-01)', () => {
    expect(
      toErrorMessage({ code: 'HRM-REC-CMP-MAX-N', message: 'raw' }, 'fallback'),
    ).toContain('tối đa');
    expect(
      toErrorMessage({ code: 'HRM-REC-CMP-YCTD-MIX', message: 'raw' }, 'fallback'),
    ).toContain('hai yêu cầu');
  });
});
