/**
 * @CODE-MEMORY
 * Screen:     /contracts — wizard Bước 1 field visibility
 * UC:         FR-UC-BP-CORE-09d · PO-HRM-CTR-CREATE-REDESIGN
 * Purpose:    AMIS manifest + template_code family deltas — open catalog, no closed enum 8.
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-01
 * must_keep:  BIND SA-01 §5 · không hardcode ceiling picker
 */

import { normalizeTemplateCode } from '@/lib/contractTemplateCatalog';

export type ContractTemplateFamilyHint =
  | 'probation'
  | 'ft_12m'
  | 'ft_24m'
  | 'indefinite'
  | 'unknown';

export type ContractCreateVisibleBlocks = {
  showEffectiveTo: boolean;
  effectiveToRequired: boolean;
  showDriverBlock: boolean;
  defaultDurationMonths: number | null;
  termHint: ContractTemplateFamilyHint;
};

export function inferTemplateFamily(templateCode: string | undefined | null): ContractTemplateFamilyHint {
  const code = normalizeTemplateCode(templateCode);
  if (!code) return 'unknown';
  if (code.includes('PROBATION')) return 'probation';
  if (code.includes('INDEF')) return 'indefinite';
  if (code.includes('FT_24M') || code.includes('24M')) return 'ft_24m';
  if (code.includes('FT_12M') || code.includes('12M')) return 'ft_12m';
  if (code.includes('DEFINITE') || code.includes('FT_')) return 'ft_12m';
  return 'unknown';
}

export function isDriverPack(packCode: string | undefined | null, templateCode?: string | null): boolean {
  const pack = (packCode ?? '').trim().toUpperCase();
  if (pack === 'DRIVER') return true;
  const code = normalizeTemplateCode(templateCode);
  return code.includes('DRIVER');
}

export function visibleBlocksForTemplate(
  templateCode: string | undefined | null,
  packCode?: string | null,
): ContractCreateVisibleBlocks {
  const family = inferTemplateFamily(templateCode);
  const indefinite = family === 'indefinite';
  let defaultDurationMonths: number | null = null;
  if (family === 'probation') defaultDurationMonths = 2;
  if (family === 'ft_12m') defaultDurationMonths = 12;
  if (family === 'ft_24m') defaultDurationMonths = 24;

  return {
    showEffectiveTo: !indefinite,
    effectiveToRequired: !indefinite,
    showDriverBlock: isDriverPack(packCode, templateCode),
    defaultDurationMonths,
    termHint: family,
  };
}

/** Add months to date (calendar month approximation for AMIS presets). */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function applyTemplateDurationHint(
  effectiveFrom: Date | undefined,
  templateCode: string | undefined | null,
  packCode?: string | null,
): Date | undefined {
  if (!effectiveFrom) return undefined;
  const blocks = visibleBlocksForTemplate(templateCode, packCode);
  if (!blocks.showEffectiveTo) return undefined;
  if (blocks.termHint === 'probation') return addDays(effectiveFrom, 60);
  if (blocks.defaultDurationMonths) return addMonths(effectiveFrom, blocks.defaultDurationMonths);
  return undefined;
}
