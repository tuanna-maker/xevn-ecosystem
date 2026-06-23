#!/usr/bin/env node
/**
 * MOB-UX-18 — Chrome dedup static gate (ILA-05).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const mobileRoot = join(process.cwd(), 'apps/mobile/hrm-mobile/src');
const failures = [];

function read(rel) {
  const p = join(mobileRoot, rel);
  if (!existsSync(p)) {
    failures.push(`missing: ${rel}`);
    return '';
  }
  return readFileSync(p, 'utf8');
}

const leave = read('features/attendance/LeaveRequestsListScreen.tsx');
// Empty CTA + sticky footer same label = duplicate primary action (CHROME-02)
if (/EmptyLeaveIllustration[\s\S]*onCtaPress/.test(leave) && /StickyFooter[\s\S]*Đăng ký nghỉ/.test(leave)) {
  failures.push('LeaveRequestsListScreen: empty CTA + sticky footer both present (CHROME-02)');
}

const payslip = read('features/payroll/PayslipListScreen.tsx');
// Tab-root must not repeat vi.payslips as in-content large title (CHROME-01)
if (
  /styles\.title[\s\S]*vi\.payslips/.test(payslip) ||
  (/styles\.title[\s\S]*screenTitle/.test(payslip) && !/showInContentPeriodTitle/.test(payslip))
) {
  failures.push('PayslipListScreen: in-content title duplicates stack vi.payslips (CHROME-01)');
}

const payroll = read('features/payroll/PayrollSummaryScreen.tsx');
if (/styles\.title[\s\S]*vi\.payroll/.test(payroll) || /<Text[^>]*>\s*\{vi\.payroll\}/.test(payroll)) {
  failures.push('PayrollSummaryScreen: in-content title duplicates stack vi.payroll (CHROME-01)');
}

const contracts = read('features/contracts/ContractsScreen.tsx');
if (
  /headerTitle[\s\S]*vi\.contracts/.test(contracts) ||
  /<Text[^>]*headerTitle[^>]*>\s*\{vi\.contracts\}/.test(contracts)
) {
  failures.push('ContractsScreen: in-content title duplicates stack vi.contracts (CHROME-01)');
}

const profile = read('features/profile/ProfileScreen.tsx');
if (/AppScreenLayout[\s\S]*title=\{vi\.profile\}/.test(profile) && !/stackHeaderPresent/.test(profile)) {
  failures.push('ProfileScreen: AppScreenLayout title duplicates stack header (CHROME-01)');
}

const approvals = read('features/attendance/ManagerApprovalsScreen.tsx');
if (/AppScreenLayout[\s\S]*title=\{vi\.approvals\}/.test(approvals) && !/stackHeaderPresent/.test(approvals)) {
  failures.push('ManagerApprovalsScreen: AppScreenLayout title duplicates stack header (CHROME-01)');
}

const notifications = read('features/notifications/InAppNotificationsScreen.tsx');
if (
  /AppScreenLayout[\s\S]*title=\{vi\.notifications\}/.test(notifications) &&
  !/stackHeaderPresent/.test(notifications)
) {
  failures.push('InAppNotificationsScreen: AppScreenLayout title duplicates stack header (CHROME-01)');
}

if (failures.length) {
  console.error('verify:mobile:chrome — FAIL');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('verify:mobile:chrome — PASS');
process.exit(0);
