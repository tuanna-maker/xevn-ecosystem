import type { NavigatorScreenParams } from '@react-navigation/native';

export type AttendanceStackParamList = {
  CheckIn: undefined;
  AttendanceHistory: undefined;
};

export type RequestsStackParamList = {
  UpdateRequests: undefined;
  CreateUpdateRequest: undefined;
  CreateLeaveRequest: undefined;
};

export type MoreStackParamList = {
  Settings: undefined;
  Scope: undefined;
  ManagerApprovals: undefined;
  PayrollSummary: undefined;
  Contracts: undefined;
  Operations: undefined;
  Profile: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  TabDashboard: undefined;
  TabAttendance: NavigatorScreenParams<AttendanceStackParamList>;
  TabRequests: NavigatorScreenParams<RequestsStackParamList>;
  TabMore: NavigatorScreenParams<MoreStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};
