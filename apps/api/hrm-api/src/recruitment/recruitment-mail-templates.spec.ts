import {
  isStandardRecMailTemplateCode,
  isValidRecMailTemplateCode,
  mergeRecMailTemplateCatalog,
} from './recruitment-mail-templates';

describe('mergeRecMailTemplateCatalog CRUD', () => {
  it('keeps 3 standards and appends custom templates', () => {
    const merged = mergeRecMailTemplateCatalog([
      {
        code: 'interview_invite',
        label_vi: 'Mời PV chỉnh',
        subject: 'S',
        body: 'B',
        active: true,
      },
      {
        code: 'thank_you',
        label_vi: 'Cảm ơn',
        subject: 'Cảm ơn {{candidate_name}}',
        body: 'Body',
        active: true,
      },
    ]);
    expect(merged.map((t) => t.code)).toEqual([
      'fail_cv',
      'interview_invite',
      'offer',
      'thank_you',
    ]);
    expect(merged.find((t) => t.code === 'interview_invite')?.label_vi).toBe(
      'Mời PV chỉnh',
    );
    expect(merged.find((t) => t.code === 'thank_you')?.active).toBe(true);
  });

  it('omitting a custom on save drops it (delete)', () => {
    const afterDelete = mergeRecMailTemplateCatalog([
      {
        code: 'fail_cv',
        label_vi: 'Từ chối CV (fail_cv)',
        subject: 's',
        body: 'b',
        active: true,
      },
      {
        code: 'interview_invite',
        label_vi: 'Mời',
        subject: 's',
        body: 'b',
        active: true,
      },
      {
        code: 'offer',
        label_vi: 'Offer',
        subject: 's',
        body: 'b',
        active: true,
      },
    ]);
    expect(afterDelete.every((t) => isStandardRecMailTemplateCode(t.code))).toBe(
      true,
    );
    expect(afterDelete).toHaveLength(3);
  });

  it('rejects invalid codes', () => {
    expect(isValidRecMailTemplateCode('Thank You')).toBe(false);
    expect(isValidRecMailTemplateCode('thank_you')).toBe(true);
    expect(isStandardRecMailTemplateCode('offer')).toBe(true);
  });
});
