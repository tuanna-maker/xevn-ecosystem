import type { InboxHubRow } from './dashboardHub';
import {
  formatDisplayDateFromMonthDay,
  monthDayFromIsoDate,
  type EmployeeCelebrationSource,
  type HomeCelebrationItem,
} from './dashboardHubCelebrate';
import { resolveInboxEventTypeVi } from './dashboardEss';
import { formatHrmDate, formatHrmDateTime, parseHrmDateOnly } from './formatHrm';
import { resolveEmployeeInitials } from './resolveHrmAvatarUrl';
import type { HomePayslipTeaser } from '../components/home/HomeFeedSection';

export type JourneyEventKind =
  | 'tenure_join'
  | 'tenure_milestone'
  | 'birthday'
  | 'attendance'
  | 'payslip'
  | 'workflow';

export type JourneyTimelineEvent = {
  id: string;
  kind: JourneyEventKind;
  title: string;
  subtitle: string;
  dateIso: string;
  year: number;
  sortKey: string;
};

export type CelebrationChipKind = 'birthday' | 'tenure';

export type CelebrationChipItem = {
  employee_id: string;
  display_name: string;
  avatar_url: string | null;
  avatar_initials: string;
  kind: CelebrationChipKind;
  /** Short label under avatar — e.g. «Sinh nhật» or «3 năm». */
  chipLabel: string;
};

export type HomeTenureItem = {
  employee_id: string;
  display_name: string;
  years: number;
  display_date: string;
  avatar_url: string | null;
  avatar_initials: string;
};

const TENURE_MILESTONE_YEARS = [1, 3, 5, 10, 15, 20] as const;

/** Years between hire date and reference date (floor). */
export function resolveTenureYears(
  hiredAt: string | null | undefined,
  reference = new Date(),
): number | null {
  const hired = parseHrmDateOnly(hiredAt);
  if (!hired) return null;
  let years = reference.getFullYear() - hired.getFullYear();
  const refMonth = reference.getMonth();
  const hireMonth = hired.getMonth();
  const refDay = reference.getDate();
  const hireDay = hired.getDate();
  if (refMonth < hireMonth || (refMonth === hireMonth && refDay < hireDay)) {
    years -= 1;
  }
  return years >= 0 ? years : null;
}

/** Hire anniversary month-day matches today — BR-TENURE-01. */
export function isHireAnniversaryToday(
  hiredAt: string | null | undefined,
  todayMonthDay: string,
): boolean {
  const monthDay = monthDayFromIsoDate(hiredAt);
  return Boolean(monthDay && todayMonthDay && monthDay === todayMonthDay);
}

export function formatTenureYearsVi(years: number): string {
  if (years <= 0) return 'Gia nhập';
  return `${years} năm`;
}

/** Colleagues with work anniversary today from employees API. */
export function composeTenureFromEmployees(
  employees: EmployeeCelebrationSource[],
  todayMonthDay: string,
  limit = 10,
): HomeTenureItem[] {
  if (!todayMonthDay) return [];
  const hits: HomeTenureItem[] = [];
  for (const emp of employees) {
    if (hits.length >= limit) break;
    const status = (emp.status ?? 'active').toLowerCase();
    if (status !== 'active') continue;
    if (emp.archived_at?.trim()) continue;
    if (!isHireAnniversaryToday(emp.hired_at, todayMonthDay)) continue;
    const years = resolveTenureYears(emp.hired_at) ?? 0;
    if (years < 1) continue;
    const displayName = emp.full_name?.trim();
    if (!displayName) continue;
    const monthDay = monthDayFromIsoDate(emp.hired_at) ?? todayMonthDay;
    hits.push({
      employee_id: emp.id,
      display_name: displayName,
      years,
      display_date: formatDisplayDateFromMonthDay(monthDay),
      avatar_url: emp.avatar_url ?? null,
      avatar_initials: resolveEmployeeInitials(displayName),
    });
  }
  return hits;
}

export function mapBirthdaysToChips(items: HomeCelebrationItem[]): CelebrationChipItem[] {
  return items.map((item) => ({
    employee_id: item.employee_id,
    display_name: item.display_name,
    avatar_url: item.avatar_url,
    avatar_initials: item.avatar_initials,
    kind: 'birthday' as const,
    chipLabel: 'Sinh nhật',
  }));
}

export function mapTenureToChips(items: HomeTenureItem[]): CelebrationChipItem[] {
  return items.map((item) => ({
    employee_id: item.employee_id,
    display_name: item.display_name,
    avatar_url: item.avatar_url,
    avatar_initials: item.avatar_initials,
    kind: 'tenure' as const,
    chipLabel: formatTenureYearsVi(item.years),
  }));
}

export function mergeCelebrationChips(
  birthdays: HomeCelebrationItem[],
  tenure: HomeTenureItem[],
  limit = 10,
): CelebrationChipItem[] {
  const merged = [...mapBirthdaysToChips(birthdays), ...mapTenureToChips(tenure)];
  return merged.slice(0, limit);
}

function eventDateParts(dateIso: string): { year: number; sortKey: string } {
  const iso = dateIso.slice(0, 10);
  const year = Number(iso.slice(0, 4)) || new Date().getFullYear();
  return { year, sortKey: iso };
}

/** Self tenure milestones from hire date — read-only. */
export function buildSelfTenureMilestones(
  hiredAt: string | null | undefined,
  displayName: string,
): JourneyTimelineEvent[] {
  const hired = parseHrmDateOnly(hiredAt);
  if (!hired) return [];
  const hireIso = `${hired.getFullYear()}-${String(hired.getMonth() + 1).padStart(2, '0')}-${String(hired.getDate()).padStart(2, '0')}`;
  const events: JourneyTimelineEvent[] = [
    {
      id: 'tenure-join',
      kind: 'tenure_join',
      title: 'Gia nhập công ty',
      subtitle: displayName.trim() || 'Bạn',
      dateIso: hireIso,
      ...eventDateParts(hireIso),
    },
  ];

  const now = new Date();
  for (const milestone of TENURE_MILESTONE_YEARS) {
    const milestoneDate = new Date(hired);
    milestoneDate.setFullYear(hired.getFullYear() + milestone);
    if (milestoneDate > now) continue;
    const iso = `${milestoneDate.getFullYear()}-${String(milestoneDate.getMonth() + 1).padStart(2, '0')}-${String(milestoneDate.getDate()).padStart(2, '0')}`;
    events.push({
      id: `tenure-${milestone}y`,
      kind: 'tenure_milestone',
      title: `${milestone} năm gắn bó`,
      subtitle: 'Cột mốc thâm niên',
      dateIso: iso,
      ...eventDateParts(iso),
    });
  }
  return events;
}

function inboxRowToJourneyEvent(row: InboxHubRow): JourneyTimelineEvent | null {
  const created = row.created_at?.trim();
  if (!created) return null;
  const eventType = row.event_type?.trim() ?? '';
  const lower = eventType.toLowerCase();
  let kind: JourneyEventKind = 'workflow';
  if (lower.includes('payslip') || lower.includes('payroll')) kind = 'payslip';
  else if (lower.includes('attendance') || lower.includes('check')) kind = 'attendance';
  else if (lower.includes('leave')) kind = 'workflow';

  const title = resolveInboxEventTypeVi(eventType);
  const parts = eventDateParts(created.slice(0, 10));
  return {
    id: `inbox-${row.id}`,
    kind,
    title,
    subtitle: formatHrmDateTime(created),
    dateIso: created.slice(0, 10),
    year: parts.year,
    sortKey: created,
  };
}

export type JourneyFeedInput = {
  displayName: string;
  hiredAt: string | null | undefined;
  checkInSummary: string;
  checkInStatus: string;
  checkInDateIso: string;
  payslipTeaser: HomePayslipTeaser | null;
  inboxRows: InboxHubRow[];
  celebrations: HomeCelebrationItem[];
  tenureToday: HomeTenureItem[];
};

/** Compose read-only journey events from existing dashboard feed slices. */
export function buildJourneyEventsFromFeed(input: JourneyFeedInput): JourneyTimelineEvent[] {
  const events: JourneyTimelineEvent[] = [
    ...buildSelfTenureMilestones(input.hiredAt, input.displayName),
  ];

  if (input.checkInSummary?.trim() && input.checkInStatus && input.checkInStatus !== 'neutral') {
    const iso = input.checkInDateIso.slice(0, 10);
    events.push({
      id: 'attendance-today',
      kind: 'attendance',
      title: 'Chấm công hôm nay',
      subtitle: input.checkInSummary.trim(),
      dateIso: iso,
      ...eventDateParts(iso),
    });
  }

  if (input.payslipTeaser) {
    const iso = input.checkInDateIso.slice(0, 10);
    events.push({
      id: `payslip-${input.payslipTeaser.id}`,
      kind: 'payslip',
      title: `Phiếu lương ${input.payslipTeaser.periodLabel}`,
      subtitle: 'Bảng lương mới nhất',
      dateIso: iso,
      ...eventDateParts(iso),
    });
  }

  for (const row of input.inboxRows.slice(0, 8)) {
    const mapped = inboxRowToJourneyEvent(row);
    if (mapped) events.push(mapped);
  }

  for (const b of input.celebrations.slice(0, 3)) {
    const iso = input.checkInDateIso.slice(0, 10);
    events.push({
      id: `birthday-${b.employee_id}`,
      kind: 'birthday',
      title: `Sinh nhật ${b.display_name}`,
      subtitle: b.display_date ? `Hôm nay · ${b.display_date}` : 'Hôm nay',
      dateIso: iso,
      ...eventDateParts(iso),
    });
  }

  for (const t of input.tenureToday.slice(0, 3)) {
    const iso = input.checkInDateIso.slice(0, 10);
    events.push({
      id: `tenure-today-${t.employee_id}`,
      kind: 'tenure_milestone',
      title: `${t.display_name} · ${formatTenureYearsVi(t.years)}`,
      subtitle: 'Kỷ niệm thâm niên hôm nay',
      dateIso: iso,
      ...eventDateParts(iso),
    });
  }

  return dedupeAndSortJourneyEvents(events);
}

export function dedupeAndSortJourneyEvents(events: JourneyTimelineEvent[]): JourneyTimelineEvent[] {
  const seen = new Set<string>();
  const unique: JourneyTimelineEvent[] = [];
  for (const ev of events) {
    if (seen.has(ev.id)) continue;
    seen.add(ev.id);
    unique.push(ev);
  }
  return unique.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

export function limitJourneyPreview(
  events: JourneyTimelineEvent[],
  limit = 3,
): JourneyTimelineEvent[] {
  return dedupeAndSortJourneyEvents(events).slice(0, limit);
}

export type JourneyYearSection = {
  year: number;
  title: string;
  data: JourneyTimelineEvent[];
};

/** Group timeline events by calendar year for JourneyScreen. */
export function groupJourneyEventsByYear(events: JourneyTimelineEvent[]): JourneyYearSection[] {
  const sorted = dedupeAndSortJourneyEvents(events);
  const byYear = new Map<number, JourneyTimelineEvent[]>();
  for (const ev of sorted) {
    const bucket = byYear.get(ev.year) ?? [];
    bucket.push(ev);
    byYear.set(ev.year, bucket);
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, data]) => ({
      year,
      title: String(year),
      data,
    }));
}

export function shouldShowJourneySection(events: JourneyTimelineEvent[]): boolean {
  return events.length > 0;
}

export function shouldShowCultureStrip(chips: CelebrationChipItem[]): boolean {
  return chips.length > 0;
}

export function formatJourneyEventDate(dateIso: string): string {
  return formatHrmDate(dateIso);
}
