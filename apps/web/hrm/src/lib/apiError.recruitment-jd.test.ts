/**
 * PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01 — toast taxonomy for JD library / YCTD bind.
 */
import { describe, expect, it } from 'vitest';
import { toErrorMessage } from '@/lib/apiError';

describe('toErrorMessage JD library PUB / CODE-DUP / YCTD-STATUS', () => {
  it('maps HRM-REC-JD-PUB-REQUIRED distinctly (P01)', () => {
    const msg = toErrorMessage(
      { code: 'HRM-REC-JD-PUB-REQUIRED', message: 'raw' },
      'fallback',
    );
    expect(msg).toMatch(/thiếu|bắt buộc/i);
    expect(msg).not.toMatch(/trùng mã/i);
    expect(msg).not.toMatch(/Hiệu lực khác/i);
  });

  it('maps HRM-REC-JD-PUB-LAYOUT-EMPTY distinctly (P02)', () => {
    const msg = toErrorMessage(
      { code: 'HRM-REC-JD-PUB-LAYOUT-EMPTY', message: 'raw' },
      'fallback',
    );
    expect(msg).toMatch(/bố cục|layout|trống/i);
  });

  it('maps HRM-REC-JD-PUB-STATE (not draft)', () => {
    const msg = toErrorMessage(
      { code: 'HRM-REC-JD-PUB-STATE', message: 'raw' },
      'fallback',
    );
    expect(msg).toMatch(/Nháp|phát hành/i);
  });

  it('maps HRM-JD-CODE-DUP (O4 / P05)', () => {
    const msg = toErrorMessage({ code: 'HRM-JD-CODE-DUP', message: 'raw' }, 'fallback');
    expect(msg).toMatch(/trùng/i);
    expect(msg).toMatch(/mã/i);
  });

  it('maps HRM-JD-YCTD-STATUS ≠ PUB (O5)', () => {
    const status = toErrorMessage(
      { code: 'HRM-JD-YCTD-STATUS', message: 'raw' },
      'fallback',
    );
    const pub = toErrorMessage(
      { code: 'HRM-REC-JD-PUB-REQUIRED', message: 'raw' },
      'fallback',
    );
    expect(status).toMatch(/Hiệu lực/i);
    expect(status).not.toBe(pub);
  });

  it('maps RETIRED-LOCKED / REACTIVATE-HOLD', () => {
    expect(
      toErrorMessage({ code: 'HRM-REC-JD-RETIRED-LOCKED', message: 'raw' }, 'fallback'),
    ).toMatch(/Ngừng|không chỉnh/i);
    expect(
      toErrorMessage({ code: 'HRM-REC-JD-REACTIVATE-HOLD', message: 'raw' }, 'fallback'),
    ).toMatch(/chưa hỗ trợ|HOLD|phục hồi/i);
  });
});
