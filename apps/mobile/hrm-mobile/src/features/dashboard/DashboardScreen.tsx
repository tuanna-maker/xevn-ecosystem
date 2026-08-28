import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';


import { AttendanceStatsRow } from '../../components/home/AttendanceStatsRow';

import { DashboardDateBar } from '../../components/home/DashboardDateBar';

import { HomeHubPersonCard } from '../../components/home/HomeHubPersonCard';

import { HomeSectionHeader } from '../../components/home/HomeSectionHeader';

import { DashboardStatCards } from '../../components/home/DashboardStatCards';

import { HomeFeedSection } from '../../components/home/HomeFeedSection';

import { HomeHeroCarousel } from '../../components/home/HomeHeroCarousel';

import { HomeTopBar } from '../../components/home/HomeTopBar';

import { HomeActivitySheet, type HomeActivitySheetSection } from '../../components/home/HomeActivitySheet';
import { HomeActivityTrigger } from '../../components/home/HomeActivityTrigger';
import { JourneyTimelineCard } from '../../components/home/JourneyTimelineCard';
import { Phase2StubModal } from '../../components/home/Phase2StubModal';
import { QuickAccessGrid } from '../../components/home/QuickAccessGrid';
import { TodayShiftWidget } from '../../components/home/TodayShiftWidget';

import { DashboardHomeShimmer } from '../../components/primitives/DashboardHomeShimmer';

import { AppScreenLayout } from '../../components/ui/AppScreenLayout';

import { ListRow } from '../../components/ui/ListRow';

import { PrimaryButton } from '../../components/ui/PrimaryButton';

import { StatusBadge } from '../../components/ui/StatusBadge';

import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { HomeCelebrationRow } from '../../components/ui/HomeCelebrationRow';

import { useAuth } from '../../context/AuthContext';

import { useNetwork } from '../../context/NetworkContext';

import { readListRows } from '../../integrations/envelope';

import { fetchEmployeeById } from '../../integrations/hrmEmployees';
import { fetchHrmOperatingUnits } from '../../integrations/hrmOperatingUnits';

import {
  EMPTY_ESS_DASHBOARD_SLICE,
  loadEssDashboardSlice,
  type EssDashboardSlice,
} from '../../integrations/dashboardEssLoad';

import { loadHomeCelebrateSections } from '../../integrations/hrmHomeSummary';

import { getDefaultBaseUrl, hrmRequest } from '../../integrations/hrmApiClient';

import { formatHrmError } from '../../integrations/mapApiError';

import {
  buildEmployeePayslipQuery,
  type PayslipListRow,
} from '../../integrations/payrollPayslips';

import { vi } from '../../i18n/vi';
import type { JourneyFeedParams, MainTabParamList } from '../../navigation/types';
import {
  navigateToContracts,
  navigateToCreateLeaveRequest,
  navigateToCreateUpdateRequest,
  navigateToJourney,
  navigateToLeaveRequestDetail,
  navigateToLeaveRequestsList,
  navigateToManagerApprovals,
  navigateToNotifications,
  navigateToOperations,
  navigateToProfileRoot,
  navigateToUpdateRequestDetail,
  navigateToUpdateRequests,
} from '../../navigation/profileStackNav';

import { ASYNC_CACHE } from '../../storage/asyncKeys';

import { colors, layout, spacing, statusToneColor, typography } from '../../theme/tokens';

import {

  buildManagerPreviewRows,

  formatManagerCardTitle,

  mergeHomeTasks,

  resolveManagerPendingCount,

  type HomeTaskNav,

  type HomeTaskRow,

  type InboxHubRow,

  type ManagerLeaveRow,

  type ManagerUpdateRow,

  type OwnPendingLeaveRow,

  type OwnPendingUpdateRow,

} from '../../utils/dashboardHub';

import {
  buildDefaultEssStatCards,
  defaultEssDashboardDate,
  resolveRoleSubtitle,
  resolveTimeBasedGreeting,
  resolveWorkflowStatusVi,
  type EssStatCardId,
} from '../../utils/dashboardEss';

import {

  formatUpcomingLeaveLine,

  pickUpcomingLeaves,

  resolveHomeDisplayName,
  resolveHomeGreeting,

  resolveTodayCheckInSummary,

  type LeaveHomeRow,

} from '../../utils/dashboardHome';

import {

  formatCelebrationCardSubtitle,

  formatWhosOutCardSubtitle,

  formatWhosOutSectionTitle,

  HOME_CELEBRATION_PREVIEW_LIMIT,
  limitCelebrationPreview,

  resolveBirthdayBannerText,

  shouldShowCelebrationsSection,

  shouldShowWhosOutSection,

  type HomeCelebrationItem,

  type HomeWhosOutItem,

} from '../../utils/dashboardHubCelebrate';

import {
  buildJourneyEventsFromFeed,
  limitJourneyPreview,
  mergeCelebrationChips,
  shouldShowCultureStrip,
  shouldShowJourneySection,
  type HomeTenureItem,
} from '../../utils/journeyTimeline';

import {
  buildHeroCarouselItems,
  pickLatestPayslipTeaser,
  resolveQuickAccessTile,
  type QuickAccessTileId,
} from '../../utils/homePortal';

import {
  HOME_ABOVE_FOLD_RENDER_ORDER,
  resolveDashboardPersonaLayout,
  type HomeSectionKey,
} from '../../utils/dashboardPersonaLayout';
import {
  resolveAboveFoldStatMaxRows,
  resolveActivityBadgeCount,
  resolveHomeAboveFoldCompact,
} from '../../utils/homeScrollBudget';
import {
  personaHasManagerInbox,
  resolveMobilePersona,
} from '../../utils/mobilePersona';

import type { HomePayslipTeaser } from '../../components/home/HomeFeedSection';

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';



type AttRow = { attendance_date: string; status: string; check_in_at?: string | null };



type DashboardSnapshot = {

  greetingName: string;

  companyLabel: string;

  avatarUrl: string | null;

  checkInSummary: string;

  checkInStatus: string;

  taskPreview: HomeTaskRow[];

  taskTotalCount: number;

  tasksError: string;

  managerPendingCount: number;

  managerPreview: ReturnType<typeof buildManagerPreviewRows>;

  managerError: string;

  upcomingLeaves: LeaveHomeRow[];

  isBirthdayToday: boolean;

  birthdayBanner: string;

  celebrations: HomeCelebrationItem[];

  celebrationsTotal: number;

  celebrationsHasMore: boolean;

  celebrationsError: string;

  tenureCelebrations: HomeTenureItem[];

  tenureTotal: number;

  tenureHasMore: boolean;

  hiredAt: string | null;

  whosOut: HomeWhosOutItem[];

  whosOutError: string;

  payslipTeaser: HomePayslipTeaser | null;

  payslipPeriodId: string;

  payslipError: string;

  cacheHint: string;

  myLeavesCount: number;

  inboxRows: InboxHubRow[];

  jobTitleKey: string;

  summaryIsManager: boolean | null;

};



const EMPTY: DashboardSnapshot = {

  greetingName: '',

  companyLabel: '',

  avatarUrl: null,

  checkInSummary: '',

  checkInStatus: '',

  taskPreview: [],

  taskTotalCount: 0,

  tasksError: '',

  managerPendingCount: 0,

  managerPreview: [],

  managerError: '',

  upcomingLeaves: [],

  isBirthdayToday: false,

  birthdayBanner: '',

  celebrations: [],

  celebrationsTotal: 0,

  celebrationsHasMore: false,

  celebrationsError: '',

  tenureCelebrations: [],

  tenureTotal: 0,

  tenureHasMore: false,

  hiredAt: null,

  whosOut: [],

  whosOutError: '',

  payslipTeaser: null,

  payslipPeriodId: '',

  payslipError: '',

  cacheHint: '',

  myLeavesCount: 0,

  inboxRows: [],

  jobTitleKey: '',

  summaryIsManager: null,

};

const EMPTY_ESS: EssDashboardSlice = EMPTY_ESS_DASHBOARD_SLICE;



type InboxEnvelope = { total?: number; data?: InboxHubRow[] };



export function DashboardScreen() {

  const auth = useAuth();

  const net = useNetwork();

  const nav = useNavigation<BottomTabNavigationProp<MainTabParamList, 'TabDashboard'>>();

  const [snap, setSnap] = useState<DashboardSnapshot>(EMPTY);

  const [essSnap, setEssSnap] = useState<EssDashboardSlice>(() => ({
    ...EMPTY_ESS_DASHBOARD_SLICE,
    statCards: buildDefaultEssStatCards(
      personaHasManagerInbox(
        resolveMobilePersona({
          roles: auth.roles,
          companyId: auth.companyId,
          memberships: auth.memberships,
          jobTitleKey: auth.jobTitleKey,
          summaryIsManager: auth.summaryIsManager,
        }),
      ),
    ),
  }));

  const [selectedDate, setSelectedDate] = useState(() => defaultEssDashboardDate());

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [phase2StubLabel, setPhase2StubLabel] = useState<string | null>(null);

  const [activitySheetOpen, setActivitySheetOpen] = useState(false);

  const [profileReady, setProfileReady] = useState(() => !auth.employeeId.trim());
  const profileEmployeeRef = useRef(auth.employeeId.trim());
  const { height: viewportHeight } = useWindowDimensions();
  const aboveFoldStatMaxRows = useMemo(
    () => resolveAboveFoldStatMaxRows(viewportHeight),
    [viewportHeight],
  );
  const aboveFoldCompact = useMemo(
    () => resolveHomeAboveFoldCompact(viewportHeight),
    [viewportHeight],
  );

  const greeting = useMemo(

    () => resolveHomeGreeting(auth.memberships, auth.employeeId, auth.companyId),

    [auth.memberships, auth.employeeId, auth.companyId],

  );

  React.useEffect(() => {
    const eid = auth.employeeId.trim();
    if (!eid) {
      setProfileReady(true);
      return;
    }

    let cancelled = false;
    const cfg = auth.getHrmAuth();

    void (async () => {
      const [emp, operatingUnits] = await Promise.all([
        fetchEmployeeById(cfg, eid).catch(() => null),
        fetchHrmOperatingUnits(cfg).catch(() => [] as Awaited<ReturnType<typeof fetchHrmOperatingUnits>>),
      ]);
      if (cancelled) return;

      const { displayName, companyLabel } = resolveHomeGreeting(
        auth.memberships,
        auth.employeeId,
        auth.companyId,
        { profileFullName: emp?.full_name, operatingUnits },
      );

      setSnap((prev) => ({
        ...prev,
        greetingName: displayName,
        companyLabel,
        avatarUrl: emp?.avatar_url ?? prev.avatarUrl,
        hiredAt: emp?.hired_at ?? prev.hiredAt,
        jobTitleKey: emp?.job_title_key?.trim() || prev.jobTitleKey,
      }));
      setProfileReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [auth, auth.employeeId, auth.companyId, auth.memberships]);

  const persona = useMemo(
    () =>
      resolveMobilePersona({
        roles: auth.roles,
        companyId: auth.companyId,
        memberships: auth.memberships,
        jobTitleKey: snap.jobTitleKey || auth.jobTitleKey,
        summaryIsManager: snap.summaryIsManager ?? auth.summaryIsManager,
      }),
    [
      auth.roles,
      auth.companyId,
      auth.memberships,
      auth.jobTitleKey,
      auth.summaryIsManager,
      snap.jobTitleKey,
      snap.summaryIsManager,
    ],
  );

  const layout = useMemo(() => resolveDashboardPersonaLayout(persona), [persona]);

  const hasManagerApprovals = layout.showManagerApprovalsPath;



  const navigateTask = useCallback(

    (target: HomeTaskNav) => {

      switch (target.target) {

        case 'LeaveRequestDetail':

          navigateToLeaveRequestDetail(nav, { id: target.id });

          break;

        case 'UpdateRequestDetail':

          navigateToUpdateRequestDetail(nav, target.id);

          break;

        case 'ManagerApprovals':

          navigateToManagerApprovals(nav);

          break;

        case 'LeaveRequestsList':

          navigateToLeaveRequestsList(nav);

          break;

        case 'UpdateRequests':

          navigateToUpdateRequests(nav);

          break;

        case 'InAppNotifications':

          navigateToNotifications(nav);

          break;

        case 'PayslipList':

          nav.navigate('TabPayslip', { screen: 'PayslipList' });

          break;

        case 'Operations':

          navigateToOperations(nav);

          break;

        default:

          break;

      }

    },

    [nav],

  );



  const load = useCallback(async () => {

    setLoading(true);

    setError('');

    try {

    const cfg = auth.getHrmAuth();

    const cid = auth.getAttendanceCompanyId();

    const eid = auth.employeeId.trim();

    const employeeChanged = eid !== profileEmployeeRef.current;
    if (employeeChanged) {
      profileEmployeeRef.current = eid;
      if (eid) {
        setProfileReady(false);
      }
    }

    const [emp, operatingUnits] = await Promise.all([
      eid ? fetchEmployeeById(cfg, eid).catch(() => null) : Promise.resolve(null),
      fetchHrmOperatingUnits(cfg).catch(() => [] as Awaited<ReturnType<typeof fetchHrmOperatingUnits>>),
    ]);

    const { displayName, companyLabel } = resolveHomeGreeting(
      auth.memberships,
      auth.employeeId,
      auth.companyId,
      { profileFullName: emp?.full_name, operatingUnits },
    );

    let avatarUrl: string | null = emp?.avatar_url ?? null;
    let hiredAt: string | null = emp?.hired_at ?? null;
    let jobTitleKey = emp?.job_title_key?.trim() ?? auth.jobTitleKey?.trim() ?? '';

    setSnap((prev) => ({
      ...prev,
      greetingName: displayName,
      companyLabel,
      avatarUrl: avatarUrl ?? prev.avatarUrl,
      hiredAt: hiredAt ?? prev.hiredAt,
      jobTitleKey: jobTitleKey || prev.jobTitleKey,
    }));
    setProfileReady(true);

    const personaForLoad = resolveMobilePersona({
      roles: auth.roles,
      companyId: auth.companyId,
      memberships: auth.memberships,
      jobTitleKey,
      summaryIsManager: auth.summaryIsManager,
    });
    const isManager = personaHasManagerInbox(personaForLoad);

    const roleSubtitle = resolveRoleSubtitle(jobTitleKey);
    const essSeedCards = buildDefaultEssStatCards(isManager);
    setEssSnap((prev) => ({
      ...prev,
      roleSubtitle,
      statCards: essSeedCards,
    }));

    void loadEssDashboardSlice({
      auth: cfg,
      companyId: cid,
      employeeId: eid,
      isManager,
      selectedDate,
      managerPendingCount: 0,
      offWorkCount: 0,
      myLeavesCount: 0,
    })
      .then((earlyEss) => {
        setEssSnap((prev) => ({
          ...prev,
          ...earlyEss,
          statCards:
            earlyEss.statCards.length > 0
              ? earlyEss.statCards
              : prev.statCards.length > 0
                ? prev.statCards
                : buildDefaultEssStatCards(isManager),
        }));
      })
      .catch(() => undefined);

    const persistSnapshot = async (data: DashboardSnapshot) => {

      try {

        await AsyncStorage.setItem(

          ASYNC_CACHE.DASHBOARD_V1,

          JSON.stringify({ savedAt: new Date().toISOString(), ...data }),

        );

      } catch {

        /* cache write must not reject home load */

      }

    };



    const restoreFromCache = async () => {

      const raw = await AsyncStorage.getItem(ASYNC_CACHE.DASHBOARD_V1);

      if (!raw) {

        setSnap({

          ...EMPTY,

          greetingName: displayName,

          companyLabel,

          avatarUrl,

          cacheHint: 'Không có dữ liệu ngoại tuyến.',

        });

        return;

      }

      try {

        const j = JSON.parse(raw) as DashboardSnapshot & { savedAt?: string };

        setSnap({

          ...EMPTY,

          ...j,

          greetingName: j.greetingName || displayName,

          companyLabel: j.companyLabel || companyLabel,

          cacheHint: `Đang xem bản lưu (${j.savedAt ? new Date(j.savedAt).toLocaleString('vi-VN') : '?'})`,

        });

      } catch {

        setError('Không đọc được dữ liệu đã lưu.');

      }

    };



    if (net.ready && net.offline) {

      await restoreFromCache();

      return;

    }



    const today = new Date().toISOString().slice(0, 10);



    const attPromise =

      cid && eid

        ? (() => {

            const aq = new URLSearchParams({

              company_id: cid,

              employee_id: eid,

              from_date: today,

              to_date: today,

              page: '1',

              page_size: '10',

            });

            return hrmRequest<unknown>(cfg, `/attendance/records?${aq.toString()}`, { method: 'GET' });

          })()

        : Promise.resolve(null);



    const leavePromise =

      cid && eid

        ? hrmRequest<unknown>(

            cfg,

            `/attendance/leave-requests?${new URLSearchParams({ company_id: cid, employee_id: eid }).toString()}`,

            { method: 'GET' },

          )

        : Promise.resolve(null);



    const pendingLeavePromise =

      cid && eid

        ? hrmRequest<unknown>(

            cfg,

            `/attendance/leave-requests?${new URLSearchParams({ company_id: cid, employee_id: eid, status: 'pending' }).toString()}`,

            { method: 'GET' },

          )

        : Promise.resolve(null);



    const pendingUpdatePromise =

      cid && eid

        ? hrmRequest<unknown>(

            cfg,

            `/attendance/update-requests?${new URLSearchParams({ company_id: cid, employee_id: eid, status: 'pending' }).toString()}`,

            { method: 'GET' },

          )

        : Promise.resolve(null);



    const batch1 = await Promise.allSettled([attPromise, leavePromise, pendingLeavePromise, pendingUpdatePromise]);



    let checkInSummary = '';

    let checkInStatus = 'neutral';



    if (cid && eid) {

      const attRes = batch1[0];

      if (attRes.status === 'fulfilled' && attRes.value) {

        const res = attRes.value;

        if (res.ok) {

          const rows = readListRows<AttRow>(res.data);

          const { summary, status } = resolveTodayCheckInSummary(rows.length > 0, rows[0]?.check_in_at);

          checkInSummary = summary;

          checkInStatus = status;

        } else {

          checkInSummary = formatHrmError(res);

          checkInStatus = 'error';

        }

      } else {

        checkInSummary = 'Không tải được chấm công';

        checkInStatus = 'error';

      }

    } else {

      checkInSummary = 'Cần đăng nhập đầy đủ phạm vi nhân viên';

      checkInStatus = 'neutral';

    }



    let upcomingLeaves: LeaveHomeRow[] = [];

    let myLeavesCount = 0;

    const leaveRes = batch1[1];

    if (leaveRes.status === 'fulfilled' && leaveRes.value?.ok) {

      const allLeaves = readListRows<LeaveHomeRow>(leaveRes.value.data);

      myLeavesCount = allLeaves.length;

      upcomingLeaves = pickUpcomingLeaves(allLeaves, today);

    }



    let ownPendingLeave: OwnPendingLeaveRow[] = [];

    const pendLeaveRes = batch1[2];

    if (pendLeaveRes.status === 'fulfilled' && pendLeaveRes.value?.ok) {

      ownPendingLeave = readListRows<OwnPendingLeaveRow>(pendLeaveRes.value.data);

    }



    let ownPendingUpdate: OwnPendingUpdateRow[] = [];

    const pendUpdateRes = batch1[3];

    if (pendUpdateRes.status === 'fulfilled' && pendUpdateRes.value?.ok) {

      ownPendingUpdate = readListRows<OwnPendingUpdateRow>(pendUpdateRes.value.data);

    }



    let inboxRows: InboxHubRow[] = [];

    let tasksError = '';

    let managerPendingCount = 0;

    let managerPreview: ReturnType<typeof buildManagerPreviewRows> = [];

    let managerError = '';



    const inboxPromise =

      cid && eid

        ? hrmRequest<InboxEnvelope>(

            cfg,

            `/notifications/inbox?${new URLSearchParams({ company_id: cid, employee_id: eid, limit: '5' }).toString()}`,

            { method: 'GET' },

          )

        : Promise.resolve(null);



    const managerLeavePromise =

      isManager && cid && eid

        ? hrmRequest<unknown>(

            cfg,

            `/attendance/leave-requests?${new URLSearchParams({

              company_id: cid,

              status: 'pending',

              manager_employee_id: eid,

            }).toString()}`,

            { method: 'GET' },

          )

        : Promise.resolve(null);



    const managerUpdatePromise =

      isManager && cid && eid

        ? hrmRequest<unknown>(

            cfg,

            `/attendance/update-requests?${new URLSearchParams({

              company_id: cid,

              status: 'pending',

              manager_employee_id: eid,

            }).toString()}`,

            { method: 'GET' },

          )

        : Promise.resolve(null);



    const batch2 = await Promise.allSettled([inboxPromise, managerLeavePromise, managerUpdatePromise]);



    const inboxRes = batch2[0];

    if (inboxRes.status === 'fulfilled' && inboxRes.value) {

      if (inboxRes.value.ok) {

        inboxRows = inboxRes.value.data?.data ?? readListRows<InboxHubRow>(inboxRes.value.data);

      } else {

        tasksError = tasksError || formatHrmError(inboxRes.value);

      }

    } else if (cid && eid) {

      tasksError = tasksError || 'Không tải được hộp thư';

    }



    if (pendLeaveRes.status === 'fulfilled' && pendLeaveRes.value && !pendLeaveRes.value.ok) {

      tasksError = tasksError || formatHrmError(pendLeaveRes.value);

    }

    if (pendUpdateRes.status === 'fulfilled' && pendUpdateRes.value && !pendUpdateRes.value.ok) {

      tasksError = tasksError || formatHrmError(pendUpdateRes.value);

    }



    if (isManager) {

      let mgrLeave: ManagerLeaveRow[] = [];

      let mgrUpdate: ManagerUpdateRow[] = [];

      const mgrLeaveRes = batch2[1];

      const mgrUpdateRes = batch2[2];



      if (mgrLeaveRes.status === 'fulfilled' && mgrLeaveRes.value?.ok) {

        mgrLeave = readListRows<ManagerLeaveRow>(mgrLeaveRes.value.data);

      } else if (mgrLeaveRes.status === 'fulfilled' && mgrLeaveRes.value) {

        managerError = formatHrmError(mgrLeaveRes.value);

      }



      if (mgrUpdateRes.status === 'fulfilled' && mgrUpdateRes.value?.ok) {

        mgrUpdate = readListRows<ManagerUpdateRow>(mgrUpdateRes.value.data);

      } else if (mgrUpdateRes.status === 'fulfilled' && mgrUpdateRes.value && !managerError) {

        managerError = formatHrmError(mgrUpdateRes.value);

      }



      managerPendingCount = resolveManagerPendingCount(mgrLeave, mgrUpdate);

      managerPreview = buildManagerPreviewRows(mgrLeave, mgrUpdate, 3);

    }



    const { preview: taskPreview, totalCount: taskTotalCount } = mergeHomeTasks(

      inboxRows,

      ownPendingLeave,

      ownPendingUpdate,

      isManager,

      3,

    );



    let isBirthdayToday = false;

    let birthdayBanner = '';

    let celebrations: HomeCelebrationItem[] = [];

    let celebrationsTotal = 0;

    let celebrationsHasMore = false;

    let celebrationsError = '';

    let tenureCelebrations: HomeTenureItem[] = [];

    let tenureTotal = 0;

    let tenureHasMore = false;

    let whosOut: HomeWhosOutItem[] = [];

    let whosOutError = '';



    let payslipTeaser: HomePayslipTeaser | null = null;

    let payslipPeriodId = '';

    let payslipError = '';

    const payrollCid = auth.getPayrollQueryCompanyId();

    if (payrollCid && eid) {

      try {

        const pq = buildEmployeePayslipQuery(payrollCid, eid);

        const payRes = await hrmRequest<unknown>(cfg, `/payroll/payslips?${pq}`, { method: 'GET' });

        if (payRes.ok) {

          const payRows = readListRows<PayslipListRow>(payRes.data);

          const teaser = pickLatestPayslipTeaser(payRows);

          if (teaser) {

            payslipTeaser = teaser;

            payslipPeriodId = payRows.find((r) => r.id === teaser.id)?.period_id?.trim() ?? '';

          }

        } else {

          payslipError = formatHrmError(payRes);

        }

      } catch {

        payslipError = 'Không tải được phiếu lương';

      }

    }



    let summaryIsManager: boolean | null = auth.summaryIsManager;

    if (cid && eid) {

      let hubCelebrate: Awaited<ReturnType<typeof loadHomeCelebrateSections>> = {
        viewer: null,
        celebrations: [],
        tenureCelebrations: [],
        whosOut: [],
        celebrationsError: '',
        whosOutError: '',
        source: 'compose_fallback',
      };
      try {
        hubCelebrate = await loadHomeCelebrateSections(cfg, eid);
      } catch {
        hubCelebrate.celebrationsError = 'Không tải được sinh nhật';
        hubCelebrate.whosOutError = 'Không tải được danh sách nghỉ';
      }

      isBirthdayToday = hubCelebrate.viewer?.is_birthday_today === true;

      if (isBirthdayToday) {

        birthdayBanner = resolveBirthdayBannerText(

          hubCelebrate.viewer?.display_name || displayName,

        );

      }

      const limited = limitCelebrationPreview(hubCelebrate.celebrations);

      celebrations = limited.preview;

      celebrationsTotal = limited.totalCount;

      celebrationsHasMore = limited.hasMore;

      celebrationsError = hubCelebrate.celebrationsError;

      tenureTotal = hubCelebrate.tenureCelebrations.length;

      tenureHasMore = tenureTotal > HOME_CELEBRATION_PREVIEW_LIMIT;

      tenureCelebrations = hubCelebrate.tenureCelebrations.slice(0, HOME_CELEBRATION_PREVIEW_LIMIT);

      whosOut = hubCelebrate.whosOut;

      whosOutError = hubCelebrate.whosOutError;

      summaryIsManager = hubCelebrate.viewer?.is_manager ?? summaryIsManager;

    }

    auth.updateLocal({
      jobTitleKey: jobTitleKey || auth.jobTitleKey,
      summaryIsManager: summaryIsManager ?? null,
    });

    const next: DashboardSnapshot = {

      greetingName: displayName,

      companyLabel,

      avatarUrl,

      checkInSummary,

      checkInStatus,

      taskPreview,

      taskTotalCount,

      tasksError,

      managerPendingCount,

      managerPreview,

      managerError,

      upcomingLeaves,

      isBirthdayToday,

      birthdayBanner,

      celebrations,

      celebrationsTotal,

      celebrationsHasMore,

      celebrationsError,

      tenureCelebrations,

      tenureTotal,

      tenureHasMore,

      hiredAt,

      whosOut,

      whosOutError,

      payslipTeaser,

      payslipPeriodId,

      payslipError,

      cacheHint: '',

      myLeavesCount,

      inboxRows,

      jobTitleKey,

      summaryIsManager: summaryIsManager ?? null,

    };



    setSnap(next);

    await persistSnapshot(next);

    const resolvedPersona = resolveMobilePersona({
      roles: auth.roles,
      companyId: auth.companyId,
      memberships: auth.memberships,
      jobTitleKey,
      summaryIsManager: summaryIsManager ?? null,
    });
    const essIsManager = personaHasManagerInbox(resolvedPersona);

    const leaveRequestsCount = essIsManager

      ? managerPendingCount

      : ownPendingLeave.length + ownPendingUpdate.length;

    let ess = EMPTY_ESS;
    try {
      ess = await loadEssDashboardSlice({

        auth: cfg,

        companyId: cid,

        employeeId: eid,

        isManager: essIsManager,

        selectedDate,

        managerPendingCount: leaveRequestsCount,

        offWorkCount: whosOut.length,

        myLeavesCount,

      });
    } catch {
      ess = {
        ...EMPTY_ESS,
        statCards: buildDefaultEssStatCards(essIsManager),
      };
    }

    setEssSnap((prev) => ({
      ...ess,
      statCards:
        ess.statCards.length > 0
          ? ess.statCards
          : prev.statCards.length > 0
            ? prev.statCards
            : buildDefaultEssStatCards(essIsManager),
    }));

    } catch {

      setError('Không tải được trang chủ. Kéo xuống để thử lại.');

      setProfileReady(true);

    } finally {

      setLoading(false);

    }

  }, [auth, net.ready, net.offline, selectedDate]);



  const runLoad = useCallback(() => {

    void load().catch(() => undefined);

  }, [load]);



  useFocusEffect(

    useCallback(() => {

      runLoad();

    }, [runLoad]),

  );



  const warningTone = statusToneColor('warning');



  const goCheckIn = () => nav.navigate('TabAttendance', { screen: 'CheckIn' });

  const goTeamDirectory = () => nav.navigate('TabAttendance', { screen: 'TeamDirectory' });

  const goCreateLeave = () => navigateToCreateLeaveRequest(nav);

  const goCreateUpdateRequest = () => navigateToCreateUpdateRequest(nav);

  const goLeaveList = () => navigateToLeaveRequestsList(nav);

  const goLeaveDetail = (id: string, employeeId?: string) =>
    navigateToLeaveRequestDetail(nav, { id, employeeId });

  const goManagerApprovals = () => navigateToManagerApprovals(nav);

  const goNotifications = () => navigateToNotifications(nav);

  const goProfile = () => navigateToProfileRoot(nav);

  const goContracts = () => navigateToContracts(nav);

  const goOperations = () => navigateToOperations(nav);

  const buildJourneyFeedParams = useCallback((): JourneyFeedParams => ({
    displayName: snap.greetingName || greeting.displayName,
    hiredAt: snap.hiredAt,
    checkInSummary: snap.checkInSummary,
    checkInStatus: snap.checkInStatus,
    checkInDateIso: selectedDate,
    payslipTeaser: snap.payslipTeaser,
    inboxRows: snap.inboxRows,
    celebrations: snap.celebrations,
    tenureToday: snap.tenureCelebrations,
  }), [
    snap.greetingName,
    snap.hiredAt,
    snap.checkInSummary,
    snap.checkInStatus,
    snap.payslipTeaser,
    snap.inboxRows,
    snap.celebrations,
    snap.tenureCelebrations,
    greeting.displayName,
    selectedDate,
  ]);

  const goJourney = useCallback(() => {
    navigateToJourney(nav, buildJourneyFeedParams());
  }, [nav, buildJourneyFeedParams]);

  const goPayrollSummary = () => nav.navigate('TabPayslip', { screen: 'PayrollSummary' });

  const goPayslipHub = () =>
    nav.navigate('TabPayslip', { screen: 'PayslipList', params: { periodLabel: vi.payslips } });

  const goPayslipList = () => {

    if (snap.payslipPeriodId && snap.payslipTeaser) {

      nav.navigate('TabPayslip', {

        screen: 'PayslipList',

        params: { periodId: snap.payslipPeriodId, periodLabel: snap.payslipTeaser.periodLabel },

      });

      return;

    }

    goPayslipHub();

  };

  const handleStatCardPress = useCallback(

    (id: EssStatCardId) => {

      switch (id) {

        case 'active_team':

          goTeamDirectory();

          break;

        case 'off_work':

          goLeaveList();

          break;

        case 'leave_requests':

          if (hasManagerApprovals) goManagerApprovals();

          else goLeaveList();

          break;

        case 'my_leaves':

          goLeaveList();

          break;

        default:

          break;

      }

    },

    [hasManagerApprovals, nav, goTeamDirectory],

  );



  const goPayslipDetail = () => {

    if (!snap.payslipTeaser) {

      goPayslipHub();

      return;

    }

    nav.navigate('TabPayslip', {

      screen: 'PayslipDetail',

      params: { payslipId: snap.payslipTeaser.id, periodLabel: snap.payslipTeaser.periodLabel },

    });

  };

  const handleQuickAccessTile = useCallback(

    (id: QuickAccessTileId) => {

      const tile = resolveQuickAccessTile(id, persona);

      if (tile?.stub) {

        setPhase2StubLabel(tile.label);

        return;

      }

      switch (id) {

        case 'checkin':

          goCheckIn();

          break;

        case 'time_off':

          goLeaveList();

          break;

        case 'ot_request':
          nav.navigate('TabAttendance', { screen: 'CreateOtRequest' });
          break;

        case 'business_trip':
          nav.navigate('TabAttendance', { screen: 'CreateTripRequest' });
          break;

        case 'schedule':
          nav.navigate('TabAttendance', { screen: 'MySchedule' });
          break;

        case 'payroll':

          goPayslipList();

          break;

        case 'approve':

          if (hasManagerApprovals) goManagerApprovals();

          else goNotifications();

          break;

        case 'team':

          goTeamDirectory();

          break;

        case 'contracts':

          goContracts();

          break;

        case 'operations':

          goOperations();

          break;

        case 'notifications':

          goNotifications();

          break;

        case 'news':
          nav.navigate('TabProfile', { screen: 'InternalNews' });
          break;

        case 'journey':

          goJourney();

          break;

        case 'reports':

          setPhase2StubLabel(tile?.label ?? id);

          break;

        default:

          break;

      }

    },

    [goJourney, hasManagerApprovals, persona, nav, snap.payslipPeriodId, snap.payslipTeaser],

  );

  const quickAccessBadges = useMemo(() => {

    const counts: Partial<Record<QuickAccessTileId, number>> = {};

    if (hasManagerApprovals && snap.managerPendingCount > 0) {

      counts.approve = snap.managerPendingCount;

    } else if (!hasManagerApprovals && snap.taskTotalCount > 0) {

      counts.approve = snap.taskTotalCount;

    }

    if (snap.taskTotalCount > 0) {

      counts.notifications = snap.taskTotalCount;

    }

    return counts;

  }, [hasManagerApprovals, snap.managerPendingCount, snap.taskTotalCount]);

  /** MOB-UX-14-R6 — never skeleton-gate above-fold; stats/activity stay in a11y tree for 14d matrix. */
  const showProfileSkeleton = false;

  const belowFoldSectionOrder = useMemo(
    () =>
      layout.sectionOrder.filter(
        (key) => !(HOME_ABOVE_FOLD_RENDER_ORDER as readonly string[]).includes(key),
      ),
    [layout.sectionOrder],
  );

  const apiBaseUrl = auth.getHrmAuth().baseUrl || getDefaultBaseUrl();

  const timeGreeting = useMemo(

    () => resolveTimeBasedGreeting(snap.greetingName || greeting.displayName),

    [snap.greetingName, greeting.displayName],

  );

  const heroItems = useMemo(

    () =>

      buildHeroCarouselItems({

        viewerName: snap.greetingName || greeting.displayName,

        isBirthdayToday: snap.isBirthdayToday,

        birthdayBanner: snap.birthdayBanner,

        celebrations: snap.celebrations,

      }),

    [

      snap.greetingName,

      snap.isBirthdayToday,

      snap.birthdayBanner,

      snap.celebrations,

      greeting.displayName,

    ],

  );



  const managerPreviewContent =

    snap.managerError ? (

      <Text style={styles.moduleError}>{snap.managerError}</Text>

    ) : snap.managerPendingCount === 0 ? (

      <Text style={styles.emptyHint}>Không có đơn chờ duyệt từ cấp dưới</Text>

    ) : (

      snap.managerPreview.map((row) => (

        <ListRow

          key={row.key}

          title={row.title}

          subtitle={row.subtitle}

          status="pending"

          statusLabel="Chờ duyệt"

          onPress={goManagerApprovals}

        />

      ))

    );



  const tasksContent = (

    <>

      {snap.tasksError ? <Text style={styles.moduleError}>{snap.tasksError}</Text> : null}

      {snap.taskTotalCount === 0 && !snap.tasksError ? (

        <View style={styles.emptyTasks}>

          <Text style={styles.emptyTasksCopy}>Bạn đã xử lý hết việc hôm nay</Text>

          <View style={styles.emptyCtaRow}>

            <PrimaryButton label="Tạo đơn nghỉ" onPress={goCreateLeave} variant="secondary" />

            <PrimaryButton label="Xem thông báo" onPress={goNotifications} variant="secondary" />

          </View>

        </View>

      ) : (

        snap.taskPreview.map((row) => (

          <ListRow

            key={row.key}

            title={row.title}

            subtitle={row.subtitle}

            status={row.status}

            statusLabel={resolveWorkflowStatusVi(row.status)}

            onPress={() => navigateTask(row.navigate)}

          />

        ))

      )}

    </>

  );



  const showBirthdayBanner =

    snap.isBirthdayToday &&

    snap.birthdayBanner &&

    !heroItems.some((item) => item.kind === 'birthday_self');

  const birthdayBannerSection = showBirthdayBanner ? (

    <View style={styles.birthdayBanner} accessibilityRole="text">

      <Text style={styles.birthdayBannerText}>{snap.birthdayBanner}</Text>

    </View>

  ) : null;



  const celebrationsSection = shouldShowCelebrationsSection(snap.celebrations) ? (
    <View style={styles.section}>
      <HomeSectionHeader title="Sinh nhật hôm nay" badgeCount={snap.celebrationsTotal} />
      {snap.celebrationsError ? (
        <Text style={styles.moduleError}>{snap.celebrationsError}</Text>
      ) : null}
      <View style={styles.personCardList}>
        {snap.celebrations.map((row) => (
          <HomeHubPersonCard
            key={row.employee_id}
            displayName={row.display_name}
            subtitle={formatCelebrationCardSubtitle(row)}
            avatarUrl={row.avatar_url}
            baseUrl={apiBaseUrl}
          />
        ))}
      </View>
      {snap.celebrationsHasMore ? (
        <Text style={styles.emptyHint}>Và {snap.celebrationsTotal - snap.celebrations.length} đồng nghiệp khác</Text>
      ) : null}
    </View>
  ) : null;

  const taskSectionTitle = persona === 'employee' ? 'Việc cần làm' : 'Việc hôm nay';

  const activityBadgeCount = useMemo(
    () =>
      resolveActivityBadgeCount({
        taskCount: snap.taskTotalCount,
        managerPendingCount: snap.managerPendingCount,
        upcomingCount: snap.upcomingLeaves.length,
        hasPayslipTeaser: snap.payslipTeaser != null,
      }),
    [
      snap.taskTotalCount,
      snap.managerPendingCount,
      snap.upcomingLeaves.length,
      snap.payslipTeaser,
    ],
  );

  const activitySheetSections = useMemo((): HomeActivitySheetSection[] => {
    const sections: HomeActivitySheetSection[] = [];

    sections.push({
      key: 'payslip_feed',
      title: 'Bảng lương',
      actionLabel: 'Xem tất cả',
      onActionPress: goPayslipHub,
      testID: 'home-feed-expandable',
      content: (
        <HomeFeedSection
          embedded
          payslip={snap.payslipTeaser}
          error={snap.payslipError || undefined}
          onViewDetail={goPayslipDetail}
          onViewAll={goPayslipHub}
        />
      ),
    });

    if (layout.showManagerExpandable) {
      sections.push({
        key: 'manager_expandable',
        title: formatManagerCardTitle(snap.managerPendingCount),
        badgeCount: snap.managerPendingCount > 0 ? snap.managerPendingCount : undefined,
        actionLabel: snap.managerPendingCount > 0 ? 'Xem tất cả' : undefined,
        onActionPress: snap.managerPendingCount > 0 ? goManagerApprovals : undefined,
        testID: 'home-manager-expandable',
        content: managerPreviewContent,
      });
    }

    sections.push({
      key: 'tasks',
      title: taskSectionTitle,
      badgeCount: snap.taskTotalCount > 0 ? snap.taskTotalCount : undefined,
      actionLabel: snap.taskTotalCount > 0 ? 'Xem tất cả' : undefined,
      onActionPress: snap.taskTotalCount > 0 ? goNotifications : undefined,
      testID: 'home-tasks-expandable',
      content: tasksContent,
    });

    if (persona !== 'leader') {
      sections.push({
        key: 'today',
        title: 'Hôm nay',
        testID: 'home-today-expandable',
        content: (
          <SurfaceCard title="Chấm công">
            <View style={styles.todayRow}>
              <Text style={styles.todayText}>{snap.checkInSummary || '—'}</Text>
              {snap.checkInStatus && snap.checkInStatus !== 'neutral' ? (
                <StatusBadge
                  status={snap.checkInStatus}
                  label={resolveWorkflowStatusVi(snap.checkInStatus)}
                />
              ) : null}
            </View>
          </SurfaceCard>
        ),
      });
    }

    sections.push({
      key: 'upcoming',
      title: 'Sắp tới (nghỉ phép)',
      badgeCount: snap.upcomingLeaves.length > 0 ? snap.upcomingLeaves.length : undefined,
      actionLabel: snap.upcomingLeaves.length > 0 ? 'Xem tất cả' : undefined,
      onActionPress: snap.upcomingLeaves.length > 0 ? goLeaveList : undefined,
      testID: 'home-upcoming-expandable',
      content:
        snap.upcomingLeaves.length === 0 ? (
          <Text style={styles.emptyHint}>Không có lịch nghỉ sắp tới</Text>
        ) : (
          snap.upcomingLeaves.map((row) => (
            <ListRow
              key={row.id}
              title={formatUpcomingLeaveLine(row)}
              status={row.status}
              statusLabel={resolveWorkflowStatusVi(row.status)}
              onPress={() => goLeaveDetail(row.id)}
            />
          ))
        ),
    });

    return sections;
  }, [
    snap.payslipTeaser,
    snap.payslipError,
    snap.managerPendingCount,
    snap.taskTotalCount,
    snap.checkInSummary,
    snap.checkInStatus,
    snap.upcomingLeaves,
    layout.showManagerExpandable,
    persona,
    taskSectionTitle,
    managerPreviewContent,
    tasksContent,
    goPayslipHub,
    goPayslipDetail,
    goManagerApprovals,
    goNotifications,
    goLeaveList,
    goLeaveDetail,
  ]);

  const cultureChips = useMemo(
    () => mergeCelebrationChips(snap.celebrations, snap.tenureCelebrations),
    [snap.celebrations, snap.tenureCelebrations],
  );

  const cultureHasMore = snap.celebrationsHasMore || snap.tenureHasMore;

  const journeyPreviewEvents = useMemo(() => {
    const events = buildJourneyEventsFromFeed({
      displayName: snap.greetingName || greeting.displayName,
      hiredAt: snap.hiredAt,
      checkInSummary: snap.checkInSummary,
      checkInStatus: snap.checkInStatus,
      checkInDateIso: selectedDate,
      payslipTeaser: snap.payslipTeaser,
      inboxRows: snap.inboxRows,
      celebrations: snap.celebrations,
      tenureToday: snap.tenureCelebrations,
    });
    return limitJourneyPreview(events, 3);
  }, [
    snap.greetingName,
    snap.hiredAt,
    snap.checkInSummary,
    snap.checkInStatus,
    snap.payslipTeaser,
    snap.inboxRows,
    snap.celebrations,
    snap.tenureCelebrations,
    greeting.displayName,
    selectedDate,
  ]);

  const cultureStripSection = shouldShowCultureStrip(cultureChips) ? (
    <View style={styles.section} testID="home-culture-strip">
      <HomeSectionHeader
        title="Văn hóa hôm nay"
        badgeCount={snap.celebrationsTotal + snap.tenureTotal || undefined}
      />
      {snap.celebrationsError ? (
        <Text style={styles.moduleError}>{snap.celebrationsError}</Text>
      ) : null}
      <HomeCelebrationRow chips={cultureChips} baseUrl={apiBaseUrl} hasMore={cultureHasMore} />
    </View>
  ) : null;

  const journeyTimelineSection = shouldShowJourneySection(journeyPreviewEvents) ? (
    <JourneyTimelineCard events={journeyPreviewEvents} onViewAll={goJourney} />
  ) : null;

  const whosOutSection = shouldShowWhosOutSection(snap.whosOut) ? (

    <View style={styles.section} testID="home-whos-out-section">

      <HomeSectionHeader title={formatWhosOutSectionTitle()} badgeCount={snap.whosOut.length} />

      {snap.whosOutError ? <Text style={styles.moduleError}>{snap.whosOutError}</Text> : null}

      <View style={styles.personCardList}>

        {snap.whosOut.map((row) => (

          <HomeHubPersonCard

            key={row.leave_request_id}

            displayName={row.display_name}

            subtitle={formatWhosOutCardSubtitle(row)}

            avatarUrl={row.avatar_url}

            baseUrl={apiBaseUrl}

            onPress={() => goLeaveDetail(row.leave_request_id, row.employee_id)}

          />

        ))}

      </View>

    </View>

  ) : null;

  const renderHomeSection = useCallback(
    (sectionKey: HomeSectionKey) => {
      switch (sectionKey) {
        case 'above_fold_stats':
          return (
            <DashboardStatCards
              key={`${sectionKey}-${aboveFoldStatMaxRows}-${viewportHeight}`}
              cards={essSnap.statCards}
              isManager={hasManagerApprovals}
              maxRows={aboveFoldStatMaxRows}
              onCardPress={handleStatCardPress}
            />
          );
        case 'activity_hub':
          return (
            <HomeActivityTrigger
              key={sectionKey}
              badgeCount={activityBadgeCount > 0 ? activityBadgeCount : undefined}
              onPress={() => setActivitySheetOpen(true)}
            />
          );
        case 'hero_carousel':
          return <HomeHeroCarousel key={sectionKey} items={heroItems} />;
        case 'action_grid':
          return (
            <QuickAccessGrid
              key={`${sectionKey}-${viewportHeight}-${aboveFoldCompact ? 'compact' : 'regular'}`}
              persona={persona}
              badgeCounts={quickAccessBadges}
              onTilePress={handleQuickAccessTile}
              aboveFold
              ultraCompact={aboveFoldCompact}
            />
          );
        case 'manager_inbox_hero':
        case 'leader_pulse':
        case 'pending_strip':
        case 'team_snapshot':
        case 'tasks':
        case 'payslip_feed':
        case 'manager_expandable':
        case 'today':
        case 'upcoming':
          return null;
        case 'culture_strip':
          return cultureStripSection ? (
            <React.Fragment key={sectionKey}>{cultureStripSection}</React.Fragment>
          ) : null;
        case 'journey_timeline':
          return journeyTimelineSection ? (
            <React.Fragment key={sectionKey}>{journeyTimelineSection}</React.Fragment>
          ) : null;
        case 'celebrations':
          return (
            <React.Fragment key={sectionKey}>
              {birthdayBannerSection}
              {celebrationsSection}
            </React.Fragment>
          );
        case 'whos_out':
          return whosOutSection ? <React.Fragment key={sectionKey}>{whosOutSection}</React.Fragment> : null;
        case 'ess_date_bar':
          return !layout.showTeamSnapshot ? (
            <DashboardDateBar
              key={sectionKey}
              greeting={timeGreeting}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              showDatePicker={layout.showDatePicker}
            />
          ) : null;
        case 'ess_stats':
          return !layout.showTeamSnapshot ? (
            <AttendanceStatsRow
              key={sectionKey}
              stats={essSnap.attendanceStats}
              loading={loading}
              error={essSnap.attendanceError || undefined}
              onLatePress={goCreateUpdateRequest}
            />
          ) : null;
        case 'ess_stat_cards':
          return null;
        default:
          return null;
      }
    },
    [
      aboveFoldStatMaxRows,
      aboveFoldCompact,
      activityBadgeCount,
      birthdayBannerSection,
      celebrationsSection,
      cultureStripSection,
      essSnap.attendanceError,
      essSnap.attendanceStats,
      essSnap.statCards,
      goCreateUpdateRequest,
      handleStatCardPress,
      handleQuickAccessTile,
      viewportHeight,
      heroItems,
      journeyTimelineSection,
      layout.showDatePicker,
      layout.showTeamSnapshot,
      loading,
      persona,
      quickAccessBadges,
      selectedDate,
      setSelectedDate,
      timeGreeting,
      whosOutSection,
    ],
  );

  return (

    <AppScreenLayout

      grouped

      safeAreaTop={false}

      contentStyle={styles.homeContentFlushTop}

      loading={false}

      error={error || undefined}

      onRefresh={runLoad}

      refreshing={loading}

    >

      {snap.cacheHint ? (

        <View style={[styles.cacheBanner, { backgroundColor: warningTone.bg, borderColor: warningTone.border }]}>

          <Text style={[styles.cacheText, { color: warningTone.text }]}>{snap.cacheHint}</Text>

        </View>

      ) : null}

      <HomeTopBar

        displayName={
          snap.greetingName ||
          greeting.displayName ||
          resolveHomeDisplayName(null, auth.memberships, auth.employeeId)
        }

        roleSubtitle={essSnap.roleSubtitle}

        companyLabel={snap.companyLabel || greeting.companyLabel || undefined}

        avatarUrl={snap.avatarUrl}

        baseUrl={apiBaseUrl}

        onAvatarPress={goProfile}

        onNotificationsPress={goNotifications}

      />

      <TodayShiftWidget />

      {HOME_ABOVE_FOLD_RENDER_ORDER.map(renderHomeSection)}
      {showProfileSkeleton ? <DashboardHomeShimmer /> : null}
      {belowFoldSectionOrder.map(renderHomeSection)}

      <HomeActivitySheet
        visible={activitySheetOpen}
        sections={activitySheetSections}
        onClose={() => setActivitySheetOpen(false)}
      />

      <Phase2StubModal
        visible={phase2StubLabel !== null}
        featureLabel={phase2StubLabel ?? ''}
        onClose={() => setPhase2StubLabel(null)}
      />

    </AppScreenLayout>

  );

}



const styles = StyleSheet.create({

  homeContentFlushTop: {
    paddingTop: 0,
  },

  cacheBanner: {

    borderRadius: layout.itemGap,

    padding: spacing.sm,

    borderWidth: 1,

    marginBottom: spacing.sm,

  },

  cacheText: {

    fontSize: typography.fontSize.footnote,

    lineHeight: typography.lineHeight.footnote,

  },

  section: {

    gap: layout.itemGap,

    marginBottom: layout.sectionGap,

  },

  sectionHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

  },

  sectionTitleRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

  },

  sectionTitle: {

    fontSize: typography.fontSize.title2,

    fontWeight: typography.fontWeight.semibold,

    color: colors.text,

    lineHeight: typography.lineHeight.title2,

  },

  sectionLink: {

    fontSize: typography.fontSize.subhead,

    color: colors.primary,

    fontWeight: typography.fontWeight.medium,

  },

  badge: {

    minWidth: 22,

    height: 22,

    borderRadius: 11,

    backgroundColor: colors.primary,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: spacing.xs,

  },

  badgeText: {

    fontSize: typography.fontSize.caption,

    fontWeight: typography.fontWeight.semibold,

    color: colors.surface,

  },

  moduleError: {

    fontSize: typography.fontSize.footnote,

    color: colors.danger,

    lineHeight: typography.lineHeight.footnote,

  },

  personCardList: {

    gap: layout.itemGap,

  },

  todayRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

    minHeight: layout.listRowMinHeight / 2,

  },

  todayText: {

    flex: 1,

    fontSize: typography.fontSize.body,

    color: colors.text,

    lineHeight: typography.lineHeight.body,

  },

  emptyHint: {

    fontSize: typography.fontSize.subhead,

    color: colors.textSecondary,

    lineHeight: typography.lineHeight.subhead,

    paddingVertical: spacing.sm,

  },

  emptyTasks: {

    backgroundColor: colors.surface,

    borderRadius: layout.itemGap,

    borderWidth: 1,

    borderColor: colors.border,

    padding: layout.cardPadding,

    gap: spacing.md,

  },

  emptyTasksCopy: {

    fontSize: typography.fontSize.body,

    color: colors.text,

    lineHeight: typography.lineHeight.body,

  },

  emptyCtaRow: {

    gap: spacing.sm,

  },

  birthdayBanner: {

    backgroundColor: colors.primaryMuted,

    borderRadius: layout.itemGap,

    borderWidth: 1,

    borderColor: colors.primary,

    padding: layout.cardPadding,

    marginBottom: layout.sectionGap,

  },

  birthdayBannerText: {

    fontSize: typography.fontSize.body,

    fontWeight: typography.fontWeight.semibold,

    color: colors.primary,

    lineHeight: typography.lineHeight.body,

    textAlign: 'center',

  },

});


