import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tabSrc = readFileSync(resolve(__dirname, './CandidatesTab.tsx'), 'utf8');
const dialogSrc = readFileSync(resolve(__dirname, './CandidateAcceptOfferDialog.tsx'), 'utf8');
const detailSrc = readFileSync(resolve(__dirname, './CandidateDetailView.tsx'), 'utf8');
const apiSrc = readFileSync(resolve(__dirname, '../../integrations/hrmApi.ts'), 'utf8');

describe('CandidatesTab REC-07 accept-offer wiring', () => {
  it('opens CandidateAcceptOfferDialog for offer-ready UV', () => {
    expect(tabSrc).toContain('CandidateAcceptOfferDialog');
    expect(tabSrc).toContain('onOpenAcceptOffer');
    expect(tabSrc).toContain('shouldShowAcceptOfferCta');
    expect(tabSrc).toContain('setIsAcceptOfferOpen');
  });

  it('RETAIN HireEmployeeLinkDialog as residual (≠ FR-07 DONE alone)', () => {
    expect(tabSrc).toContain('HireEmployeeLinkDialog');
  });
});

describe('CandidateAcceptOfferDialog physical path lock', () => {
  it('POST accept-offer then transitions under /recruitment/', () => {
    expect(dialogSrc).toContain('postRecruitmentApplicationAcceptOffer');
    expect(dialogSrc).toContain('postRecruitmentCandidateTransition');
    expect(dialogSrc).toContain('getEmployeeHireReadiness');
    expect(dialogSrc).toContain('rec-accept-offer-submit');
    expect(dialogSrc).toContain('rec-accept-offer-prefill');
    expect(dialogSrc).not.toMatch(/\/api\/hrm\/rec\//);
    expect(dialogSrc).toContain('REC_HIRE_NO_REKEY_HINT_VI');
  });

  it('does not treat mail template offer as hire', () => {
    expect(dialogSrc).toContain('REC_HIRE_MAIL_NOT_HIRE_VI');
  });
});

describe('CandidateDetailView accept-offer CTA', () => {
  it('exposes Chấp nhận offer testid when onOpenAcceptOffer provided', () => {
    expect(detailSrc).toContain('onOpenAcceptOffer');
    expect(detailSrc).toContain('rec-accept-offer-open-detail');
    expect(detailSrc).toContain('Chấp nhận offer');
  });
});

describe('hrmApi REC-07 client — physical /recruitment/applications only', () => {
  it('defines accept-offer under /recruitment/applications/', () => {
    expect(apiSrc).toContain(
      '/api/hrm/recruitment/applications/${encodeURIComponent(applicationId)}/accept-offer',
    );
    expect(apiSrc).toContain('postRecruitmentApplicationAcceptOffer');
    expect(apiSrc).not.toMatch(/\/api\/hrm\/rec\/applications\/\$\{/);
  });
});
