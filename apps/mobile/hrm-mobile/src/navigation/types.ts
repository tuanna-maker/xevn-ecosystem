import type { NavigatorScreenParams } from '@react-navigation/native';

import type { HomePayslipTeaser } from '../components/home/HomeFeedSection';
import type { HomeCelebrationItem } from '../utils/dashboardHubCelebrate';
import type { HomeTenureItem } from '../utils/journeyTimeline';
import type { InboxHubRow } from '../utils/dashboardHub';

export type JourneyFeedParams = {
  displayName: string;
  hiredAt: string | null;
  checkInSummary: string;
  checkInStatus: string;
  checkInDateIso: string;
  payslipTeaser: HomePayslipTeaser | null;
  inboxRows: InboxHubRow[];
  celebrations: HomeCelebrationItem[];
  tenureToday: HomeTenureItem[];
};

export type AttendanceStackParamList = {
  TeamDirectory: undefined;
  TeamColleagueDetail: { employeeId: string };
  CheckIn: undefined;
  AttendanceHistory: undefined;
};

export type LeaveRequestPrefill = {
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  handoverTo?: string;
  handoverTasks?: string;
};

export type PayslipStackParamList = {
  PayslipList: { periodId?: string; periodLabel?: string } | undefined;
  PayslipDetail: { payslipId: string; periodLabel: string };
  PayrollSummary: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  Scope: undefined;
  ManagerApprovals: undefined;
  Contracts: undefined;
  Operations: undefined;
  Notifications: undefined;
  UpdateRequests: undefined;
  LeaveRequestsList: undefined;
  CreateUpdateRequest: undefined;
  CreateLeaveRequest: { editId?: string; prefill?: LeaveRequestPrefill } | undefined;
  UpdateRequestDetail: { id: string };
  LeaveRequestDetail: { id: string; employeeId?: string };
  Journey: { feed?: JourneyFeedParams };
};

/** Leave/update flows nested under TabProfile — not a root tab. */
export type RequestsStackParamList = Pick<
  ProfileStackParamList,
  | 'UpdateRequests'
  | 'LeaveRequestsList'
  | 'CreateUpdateRequest'
  | 'CreateLeaveRequest'
  | 'UpdateRequestDetail'
  | 'LeaveRequestDetail'
>;

/** @deprecated Use PayslipStackParamList — kept for gradual migration. */
export type MoreStackParamList = PayslipStackParamList &
  Pick<
    ProfileStackParamList,
    | 'Settings'
    | 'Scope'
    | 'ManagerApprovals'
    | 'Contracts'
    | 'Operations'
    | 'Profile'
    | 'Notifications'
  >;

export type MainTabParamList = {
  TabDashboard: { _wmResizeEpoch?: number } | undefined;
  TabAttendance: NavigatorScreenParams<AttendanceStackParamList>;
  TabPayslip: NavigatorScreenParams<PayslipStackParamList>;
  TabProfile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};
