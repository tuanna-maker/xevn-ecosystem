import { describe, expect, it } from 'vitest';
import {
  isRecEvalPassFail,
  isRecMailInviteTemplate,
  parseEmailList,
  REC_MAIL_TEMPLATE_CODES,
  validateRecEvalCommit,
  validateRecMailForm,
} from '@/lib/recCandidateMailEval';

describe('recCandidateMailEval helpers (UC-BP-REC-06)', () => {
  it('exposes CFG template_code catalog without hardcoding body', () => {
    expect(REC_MAIL_TEMPLATE_CODES).toContain('fail_cv');
    expect(REC_MAIL_TEMPLATE_CODES).toContain('interview_invite');
    expect(REC_MAIL_TEMPLATE_CODES).toContain('offer');
  });

  it('requires CC for interview_invite and allows fail_cv without CC', () => {
    expect(isRecMailInviteTemplate('interview_invite')).toBe(true);
    const inviteOk = validateRecMailForm({
      laneAId: 'cand-1',
      templateCode: 'interview_invite',
      to: ['uv@xe.vn'],
      ccInterviewers: ['pv@xe.vn'],
    });
    expect(inviteOk.ok).toBe(true);

    const inviteFail = validateRecMailForm({
      laneAId: 'cand-1',
      templateCode: 'interview_invite',
      to: ['uv@xe.vn'],
      ccInterviewers: [],
    });
    expect(inviteFail.ok).toBe(false);
    if (!inviteFail.ok) expect(inviteFail.message).toMatch(/CC/i);

    const failCv = validateRecMailForm({
      laneAId: 'cand-1',
      templateCode: 'fail_cv',
      to: ['uv@xe.vn'],
      ccInterviewers: [],
    });
    expect(failCv.ok).toBe(true);
  });

  it('rejects mail without Lane A neo', () => {
    const r = validateRecMailForm({
      laneAId: null,
      templateCode: 'fail_cv',
      to: ['uv@xe.vn'],
      ccInterviewers: [],
    });
    expect(r.ok).toBe(false);
  });

  it('rejects undeliverable fixture emails like @dev.local', () => {
    const r = validateRecMailForm({
      laneAId: 'cand-1',
      templateCode: 'fail_cv',
      to: ['admin1@dev.local'],
      ccInterviewers: [],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/dev\.local|inbox thật/i);
  });

  it('parses email lists and Pass/Fail commit gate', () => {
    expect(parseEmailList('a@xe.vn, b@xe.vn')).toEqual(['a@xe.vn', 'b@xe.vn']);
    expect(isRecEvalPassFail('pass')).toBe(true);
    expect(isRecEvalPassFail('fail')).toBe(true);
    expect(isRecEvalPassFail('pending')).toBe(false);

    const ok = validateRecEvalCommit({
      laneAId: 'lane-a',
      result: 'pass',
    });
    expect(ok.ok).toBe(true);

    const noResult = validateRecEvalCommit({
      laneAId: 'lane-a',
      result: 'pending',
    });
    expect(noResult.ok).toBe(false);

    const noNeo = validateRecEvalCommit({
      laneAId: null,
      applicationId: null,
      result: 'pass',
    });
    expect(noNeo.ok).toBe(false);
  });
});
