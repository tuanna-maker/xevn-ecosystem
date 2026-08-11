/**
 * @CODE-MEMORY
 * Screen:     Portal settings — isKpiMoneyUnit helper (unit gate for ViGroupedIntegerInput)
 * Purpose:    Keep KPI % / scores EXEMPT; only VNĐ/VND money units get thousand grouping.
 * WorkItem:   D-UX-VI-FORMAT-PORTAL-01
 * Coded:      2026-07-20
 */

/** KPI absolute money units → MUST group; % / scores stay plain type=number (EXEMPT). */
export function isKpiMoneyUnit(unit: string): boolean {
  const u = unit.trim().toLowerCase();
  if (!u) return false;
  if (u === '%' || u.includes('percent') || u.includes('%')) return false;
  return u === 'vnđ' || u === 'vnd' || u.includes('đồng') || u.includes('vnđ') || u.includes('vnd');
}
