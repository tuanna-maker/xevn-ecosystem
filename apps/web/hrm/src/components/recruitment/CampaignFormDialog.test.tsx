import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const src = readFileSync(
  resolve(__dirname, 'CampaignFormDialog.tsx'),
  'utf8',
);

describe('CampaignFormDialog — E1-A position_key catalog SoT', () => {
  it('requires position_key in zod schema (not free-text position)', () => {
    expect(src).toContain("position_key: z.string().min(1, t('recruitment.form.typeRequired'))");
    expect(src).not.toMatch(/name="position"\s+render/);
  });

  it('uses CatalogSearchPicker and buildPositionKeyFields on submit', () => {
    expect(src).toContain('CatalogSearchPicker');
    expect(src).toContain('buildPositionKeyFields(data.position_key, positionOptions)');
    expect(src).toContain('position_key: pos.position_key');
    expect(src).toContain('await createJobPosting(payload)');
  });

  it('does not send free-text position without position_key', () => {
    expect(src).not.toContain('position: data.position');
    expect(src).not.toContain('position: String(campaignData.position');
  });

  it('disables submit until catalog position is selected', () => {
    expect(src).toContain('disabled={isSubmitting || !canSubmitPosition}');
    expect(src).toContain('isCatalogPickerValueAllowed');
  });
});
