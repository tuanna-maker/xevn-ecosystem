/**
 * XEVN-THM-FE-W1-DENSITY-01 — source guards for L-OPS density remaster
 * (recruitment rainbow tabs + payroll tutorial cards).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readSrc(rel: string): string {
  return readFileSync(join(process.cwd(), rel), 'utf8');
}

function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

const RAINBOW_TAB =
  /bg-(blue|orange|green|purple|pink|red|violet|teal|indigo|cyan|sky|amber|rose)-500/;

describe('XEVN-THM-FE-W1-DENSITY-01', () => {
  it('HRM-REC top-nav has no rainbow bg-*-500 tab chrome', () => {
    const code = codeOnly(readSrc('src/pages/Recruitment.tsx'));
    expect(code).not.toMatch(RAINBOW_TAB);
    expect(code).toContain('recTabButtonClass');
    expect(code).toContain('bg-primary text-primary-foreground');
  });

  it('HRM-PAY overview has no tutorial gradient / beginner video cards', () => {
    const code = codeOnly(readSrc('src/pages/Payroll.tsx'));
    expect(code).not.toMatch(/bg-gradient-to-br \$\{step\.gradient\}/);
    expect(code).not.toMatch(/from-emerald-400 to-teal-500/);
    expect(code).not.toMatch(/beginnerGuide/);
    expect(code).not.toMatch(/watchVideo/);
    expect(code).toContain('getOpsShortcuts');
    expect(code).toContain("goShortcut('calculate')");
  });

  it('CandidatePipelineFunnel stages use xevn/primary not rainbow slate/violet', () => {
    const code = codeOnly(readSrc('src/components/recruitment/CandidatePipelineFunnel.tsx'));
    expect(code).not.toMatch(/bg-violet-500|bg-amber-500|bg-orange-500|bg-emerald-500|bg-rose-500/);
    expect(code).toContain('bg-primary');
    expect(code).toContain('text-xevn-text');
  });
});
