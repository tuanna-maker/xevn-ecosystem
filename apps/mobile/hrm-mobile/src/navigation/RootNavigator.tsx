import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { OfflineBanner } from '../components/OfflineBanner';
import { OfflineSync } from '../components/OfflineSync';
import { useAuth } from '../context/AuthContext';
import { readListRows } from '../integrations/envelope';
import { hrmRequest } from '../integrations/hrmApiClient';
import { vi } from '../i18n/vi';
import { LoginScreen } from '../features/auth/LoginScreen';
import { ScopeScreen } from '../features/auth/ScopeScreen';
import { DashboardScreen } from '../features/dashboard/DashboardScreen';
import { CheckInScreen } from '../features/attendance/CheckInScreen';
import { AttendanceHistoryScreen } from '../features/attendance/AttendanceHistoryScreen';
import { UpdateRequestsScreen } from '../features/attendance/UpdateRequestsScreen';
import { LeaveRequestsListScreen } from '../features/attendance/LeaveRequestsListScreen';
import { CreateUpdateRequestScreen } from '../features/attendance/CreateUpdateRequestScreen';
import { CreateLeaveRequestScreen } from '../features/attendance/CreateLeaveRequestScreen';
import { UpdateRequestDetailScreen } from '../features/attendance/UpdateRequestDetailScreen';
import { LeaveRequestDetailScreen } from '../features/attendance/LeaveRequestDetailScreen';
import { ManagerApprovalsScreen } from '../features/attendance/ManagerApprovalsScreen';
import { PayrollSummaryScreen } from '../features/payroll/PayrollSummaryScreen';
import { PayslipListScreen } from '../features/payroll/PayslipListScreen';
import { PayslipDetailScreen } from '../features/payroll/PayslipDetailScreen';
import { ContractsScreen } from '../features/contracts/ContractsScreen';
import { OperationsScreen } from '../features/operations/OperationsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { InAppNotificationsScreen } from '../features/notifications/InAppNotificationsScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import type {
  AttendanceStackParamList,
  MainTabParamList,
  MoreStackParamList,
  RequestsStackParamList,
  RootStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AttStack = createNativeStackNavigator<AttendanceStackParamList>();
const ReqStack = createNativeStackNavigator<RequestsStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function AttendanceStack() {
  return (
    <AttStack.Navigator>
      <AttStack.Screen name="CheckIn" component={CheckInScreen} options={{ title: vi.attendance }} />
      <AttStack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} options={{ title: vi.history }} />
    </AttStack.Navigator>
  );
}

function RequestsStack() {
  return (
    <ReqStack.Navigator>
      <ReqStack.Screen name="UpdateRequests" component={UpdateRequestsScreen} options={{ title: vi.requests }} />
      <ReqStack.Screen name="LeaveRequestsList" component={LeaveRequestsListScreen} options={{ title: vi.leaveList }} />
      <ReqStack.Screen name="CreateUpdateRequest" component={CreateUpdateRequestScreen} options={{ title: vi.createRequest }} />
      <ReqStack.Screen name="CreateLeaveRequest" component={CreateLeaveRequestScreen} options={{ title: vi.createLeave }} />
      <ReqStack.Screen name="UpdateRequestDetail" component={UpdateRequestDetailScreen} options={{ title: vi.requestDetail }} />
      <ReqStack.Screen name="LeaveRequestDetail" component={LeaveRequestDetailScreen} options={{ title: vi.leaveDetail }} />
    </ReqStack.Navigator>
  );
}

function MoreStackNavigator() {
  const auth = useAuth();
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ title: vi.settings }} />
      <MoreStack.Screen name="Scope" component={ScopeScreen} options={{ title: vi.scope }} />
      {auth.isManager ? (
        <MoreStack.Screen name="ManagerApprovals" component={ManagerApprovalsScreen} options={{ title: vi.approvals }} />
      ) : null}
      <MoreStack.Screen name="PayrollSummary" component={PayrollSummaryScreen} options={{ title: vi.payroll }} />
      <MoreStack.Screen name="PayslipList" component={PayslipListScreen} options={{ title: vi.payslips }} />
      <MoreStack.Screen name="PayslipDetail" component={PayslipDetailScreen} options={{ title: vi.payslipDetail }} />
      <MoreStack.Screen name="Contracts" component={ContractsScreen} options={{ title: vi.contracts }} />
      {auth.isManager ? (
        <MoreStack.Screen name="Operations" component={OperationsScreen} options={{ title: vi.operations }} />
      ) : null}
      <MoreStack.Screen name="Profile" component={ProfileScreen} options={{ title: vi.profile }} />
      <MoreStack.Screen name="Notifications" component={InAppNotificationsScreen} options={{ title: vi.notifications }} />
    </MoreStack.Navigator>
  );
}

function MainTabs() {
  const auth = useAuth();
  const [moreBadge, setMoreBadge] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!auth.signedIn || !auth.isManager) {
      setMoreBadge(undefined);
      return;
    }
    let cancelled = false;
    const refreshBadge = async () => {
      const cid = auth.getAttendanceCompanyId();
      const mid = auth.employeeId.trim();
      if (!cid || !mid) {
        if (!cancelled) setMoreBadge(undefined);
        return;
      }
      const q = new URLSearchParams({ company_id: cid, status: 'pending', manager_employee_id: mid });
      const [attRes, leaveRes] = await Promise.all([
        hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/update-requests?${q.toString()}`, { method: 'GET' }),
        hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/leave-requests?${q.toString()}`, { method: 'GET' }),
      ]);
      if (cancelled) return;
      if (attRes.ok && leaveRes.ok) {
        const n = readListRows(attRes.data).length + readListRows(leaveRes.data).length;
        setMoreBadge(n > 0 ? n : undefined);
      } else {
        setMoreBadge(undefined);
      }
    };
    void refreshBadge();
    const id = setInterval(() => void refreshBadge(), 90_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [auth.signedIn, auth.isManager, auth.companyUuid, auth.companyId, auth.employeeId, auth.accessToken]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <OfflineBanner />
      <OfflineSync />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#38bdf8',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: { backgroundColor: '#0f172a' },
        }}
      >
        <Tab.Screen name="TabDashboard" component={DashboardScreen} options={{ title: vi.dashboard }} />
        <Tab.Screen name="TabAttendance" component={AttendanceStack} options={{ title: vi.attendance }} />
        <Tab.Screen name="TabRequests" component={RequestsStack} options={{ title: vi.requests }} />
        <Tab.Screen
          name="TabMore"
          component={MoreStackNavigator}
          options={{
            title: vi.more,
            tabBarBadge: auth.isManager ? moreBadge : undefined,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export function RootNavigator() {
  const auth = useAuth();

  if (!auth.hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <RootStack.Navigator screenOptions={{ contentStyle: { backgroundColor: '#0f172a' } }}>
        {!auth.signedIn ? (
          <RootStack.Screen name="Login" component={LoginScreen} options={{ title: vi.login, headerShown: false }} />
        ) : (
          <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
