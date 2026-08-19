/**
 * PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01 — source locks Thư viện JD (O1/O2/O3).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tabSrc = readFileSync(resolve(__dirname, './JobTemplatesTab.tsx'), 'utf8');
const hookSrc = readFileSync(resolve(__dirname, '../../hooks/useJobTemplates.ts'), 'utf8');
const apiSrc = readFileSync(resolve(__dirname, '../../integrations/hrmApi.ts'), 'utf8');

describe('PO-HRM-MVP-GD1-REC-00 JobTemplatesTab status + publish locks', () => {
  it('chips from DTO status helpers (not boolean-only SoT)', () => {
    expect(tabSrc).toContain('resolveJdTemplateStatus');
    expect(tabSrc).toContain('jdTemplateStatusLabelVi');
    expect(tabSrc).toContain('jd-library-status-chip');
    expect(tabSrc).toContain('Nháp');
    expect(tabSrc).toContain('Hiệu lực');
    expect(tabSrc).toContain('Ngừng');
  });

  it('Phát hành → publishTemplate / POST …/publish (not PATCH status alone)', () => {
    expect(tabSrc).toContain('publishTemplate');
    expect(tabSrc).toContain('jd-library-publish-btn');
    expect(tabSrc).toContain('Phát hành');
    expect(hookSrc).toContain('publishJobDescriptionTemplate');
    expect(apiSrc).toContain('/publish?');
    expect(apiSrc).toMatch(/job-templates\/\$\{encodeURIComponent\(templateId\)\}\/publish/);
  });

  it('Network physical /recruitment/job-templates only — DENY /rec SoT', () => {
    expect(apiSrc).toContain('/api/hrm/recruitment/job-templates');
    expect(apiSrc).not.toMatch(/\/api\/hrm\/rec\/job-descriptions/);
    expect(tabSrc).not.toMatch(/\/rec\/job-descriptions/);
    expect(hookSrc).not.toMatch(/\/rec\/job-descriptions/);
  });

  it('create = Nháp toast; soft-retire Ngừng (not hard Xóa SoT)', () => {
    expect(tabSrc).toContain('Đã lưu bản Nháp');
    expect(tabSrc).toContain('Ngừng');
    expect(tabSrc).toContain('jd-library-retire-btn');
    expect(tabSrc).not.toMatch(/Đã xóa JD template/);
  });

  it('errors via toErrorMessage (PUB / CODE-DUP / YCTD-STATUS)', () => {
    expect(tabSrc).toContain('toErrorMessage');
  });

  it('CODE-MEMORY must not embed asterisk-slash that closes block comment early (FE-02)', () => {
    // R-REC-00-FE-COMMENT-ASTERISK: "PUB-*/CODE-DUP" terminated /** … */ → Vite 500
    expect(tabSrc).not.toMatch(/PUB-\*\/CODE-DUP/);
    expect(tabSrc).toContain('PUB-* / CODE-DUP');
    const header = tabSrc.slice(0, tabSrc.indexOf('\nimport '));
    const prematureClose = /\*\/(?!\s*$)/m.test(header.replace(/\s*\*\/\s*$/, ''));
    expect(prematureClose).toBe(false);
  });
});
