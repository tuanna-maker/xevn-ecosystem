#!/usr/bin/env node
/**
 * MOB-UX-16c — Layout composition static gate.
 * Fails if groupedLayout tokens drift or Home above-fold order regresses.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const mobileRoot = join(root, 'apps/mobile/hrm-mobile/src');

const failures = [];

function read(rel) {
  const p = join(mobileRoot, rel);
  if (!existsSync(p)) {
    failures.push(`missing file: ${rel}`);
    return '';
  }
  return readFileSync(p, 'utf8');
}

// Spacing tokens backing groupedLayout (MOB-UX-13d)
const tokens = read('theme/tokens.ts');
for (const [key, val] of [
  ['md: 16', 'spacing.md=16'],
  ['lg: 24', 'spacing.lg=24'],
  ['itemGap: 12', 'layout.itemGap=12'],
]) {
  if (!tokens.includes(key)) failures.push(`tokens.ts: ${val} required for groupedLayout`);
}
const grouped = read('theme/groupedLayout.ts');
for (const key of ['belowStackHeader', 'belowBalanceCards', 'listSectionTop', 'belowSubtitle', 'emptyVertical']) {
  if (!grouped.includes(key)) failures.push(`groupedLayout.${key} missing`);
}

// Home above-fold order (dashboardPersonaLayout.ts)
const personaLayout = read('utils/dashboardPersonaLayout.ts');
// ReadonlyArray<HomeSectionKey> | HomeSectionKey[] — avoid false FAIL on type annotation before `[`
const orderMatch = personaLayout.match(
  /HOME_ABOVE_FOLD_RENDER_ORDER\s*(?::\s*ReadonlyArray<[^>]+>\s*)?=\s*\[([\s\S]*?)\]/,
);
if (!orderMatch) {
  failures.push('dashboardPersonaLayout: HOME_ABOVE_FOLD_RENDER_ORDER missing');
} else {
  const order = orderMatch[1];
  const idxGrid = order.indexOf('action_grid');
  const idxStats = order.indexOf('above_fold_stats');
  const idxActivity = order.indexOf('activity_hub');
  if (idxGrid < 0 || idxStats < 0 || idxActivity < 0 || !(idxGrid < idxStats && idxStats < idxActivity)) {
    failures.push('HOME_ABOVE_FOLD_RENDER_ORDER must be action_grid → above_fold_stats → activity_hub');
  }
}

const dash = read('features/dashboard/DashboardScreen.tsx');
if (/title=\{`UC-HRM-MOB/.test(dash)) {
  failures.push('DashboardScreen: UC-HRM title leak');
}

// Notifications — no debug shell
const notif = read('features/notifications/InAppNotificationsScreen.tsx');
if (/Tóm tắt hệ thống|HRM_EVENT_WEBHOOK|Socket\.IO/i.test(notif)) {
  failures.push('InAppNotificationsScreen: debug shell must be removed');
}
if (/title=\{row\.event_type\}/.test(notif)) {
  failures.push('InAppNotificationsScreen: raw event_type title');
}

// Approvals — stack header owns title; no AppScreenLayout duplicate (ILA-05)
const approvals = read('features/attendance/ManagerApprovalsScreen.tsx');
if (/AppScreenLayout[^>]*title=["']Duyệt đơn["']/.test(approvals)) {
  failures.push('ManagerApprovalsScreen: duplicate AppScreenLayout title (ILA-05)');
}

// Grid cols default 4
const grid = read('utils/homeActionGrid.ts');
if (!/ACTION_GRID_COLS\s*=\s*4/.test(grid)) {
  failures.push('homeActionGrid: ACTION_GRID_COLS must default 4');
}

if (failures.length) {
  console.error('verify:mobile:layout — FAIL');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('verify:mobile:layout — PASS (grouped tokens, above-fold order, notification sanitization, grid cols)');
process.exit(0);
