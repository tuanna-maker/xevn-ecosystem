import { describe, expect, it } from 'vitest';
import { restorePrintSpineFromContract } from './contractPrintEditRestore';

describe('restorePrintSpineFromContract — R-CTR-XEVN-TPL-FE-EDIT-RESTORE', () => {
  it('restores template_id + template_code after create bind #9 (F5 edit)', () => {
    const state = restorePrintSpineFromContract({
      pack_code: 'GENERAL',
      template_id: '43f42772-aaaa-4bbb-8ccc-111111111111',
      template_code: 'xevn_custom_xevn9-if9062',
    });
    expect(state.packCode).toBe('GENERAL');
    expect(state.templateId).toBe('43f42772-aaaa-4bbb-8ccc-111111111111');
    expect(state.templateCode).toBe('XEVN_CUSTOM_XEVN9-IF9062');
  });

  it('defaults pack GENERAL and empty picker when unbound', () => {
    const state = restorePrintSpineFromContract({});
    expect(state.packCode).toBe('GENERAL');
    expect(state.templateId).toBe('');
    expect(state.templateCode).toBe('');
  });

  it('keeps template_id when template_code absent (list SELECT may omit code)', () => {
    const state = restorePrintSpineFromContract({
      template_id: 'uuid-tpl-9',
      pack_code: null,
      template_code: null,
    });
    expect(state.templateId).toBe('uuid-tpl-9');
    expect(state.templateCode).toBe('');
    expect(state.packCode).toBe('GENERAL');
  });
});
