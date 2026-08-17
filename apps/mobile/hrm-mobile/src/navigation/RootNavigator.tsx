import { Ionicons } from '@expo/vector-icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';

import { borderWidth, colors, brand } from '../theme/tokens';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React, { useEffect, useState } from 'react';

import { ActivityIndicator, Platform, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TAB_BAR_SAFE_ZONE_TEST_ID,
  resolveBottomSafeInset,
  resolveTabBarHeight,
} from '../theme/layoutInsets';

import { CheckInFabOverlay } from '../components/navigation/CheckInFabOverlay';

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

import { TeamDirectoryScreen } from '../features/team/TeamDirectoryScreen';

import { TeamColleagueDetailScreen } from '../features/team/TeamColleagueDetailScreen';

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

import { JourneyScreen } from '../features/journey/JourneyScreen';

import { MAIN_TAB_IA } from './mainTabIa';
import { useForceHomeTabOnResize } from './useForceHomeTabOnResize';
import { useQaMatrixHomeLock } from './useQaMatrixHomeLock';

import type {

  AttendanceStackParamList,

  MainTabParamList,

  PayslipStackParamList,

  ProfileStackParamList,

  RootStackParamList,

} from './types';



const RootStack = createNativeStackNavigator<RootStackParamList>();

const Tab = createBottomTabNavigator<MainTabParamList>();

const AttStack = createNativeStackNavigator<AttendanceStackParamList>();

const PayslipStack = createNativeStackNavigator<PayslipStackParamList>();

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();



type TabIconName = keyof typeof Ionicons.glyphMap;



function tabBarIcon(name: TabIconName, outlineName: TabIconName) {

  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (

    <Ionicons name={focused ? name : outlineName} size={size} color={color} />

  );

}



function AttendanceStack() {

  return (

    <AttStack.Navigator screenOptions={{ headerLargeTitle: true, headerLargeTitleShadowVisible: false }}>

      <AttStack.Screen

        name="TeamDirectory"

        component={TeamDirectoryScreen}

        options={{ title: vi.teamDirectory, headerLargeTitle: true }}

      />

      <AttStack.Screen

        name="TeamColleagueDetail"

        component={TeamColleagueDetailScreen}

        options={{ title: vi.colleagueDetail }}

      />

      <AttStack.Screen name="CheckIn" component={CheckInScreen} options={{ title: vi.attendance }} />

      <AttStack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} options={{ title: vi.history, headerLargeTitle: true }} />

    </AttStack.Navigator>

  );

}



function PayslipStackNavigator() {

  return (

    <PayslipStack.Navigator screenOptions={{ headerLargeTitle: true, headerLargeTitleShadowVisible: false }}>

      <PayslipStack.Screen name="PayslipList" component={PayslipListScreen} options={{ title: vi.payslips, headerLargeTitle: true }} />

      <PayslipStack.Screen name="PayslipDetail" component={PayslipDetailScreen} options={{ title: vi.payslipDetail }} />

      <PayslipStack.Screen name="PayrollSummary" component={PayrollSummaryScreen} options={{ title: vi.payroll }} />

    </PayslipStack.Navigator>

  );

}



function ProfileStackNavigator() {

  return (

    <ProfileStack.Navigator screenOptions={{ headerLargeTitle: true, headerLargeTitleShadowVisible: false }}>

      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: vi.profile, headerLargeTitle: true }} />

      <ProfileStack.Screen
        name="LeaveRequestsList"
        component={LeaveRequestsListScreen}
        options={{ title: vi.leaveList, headerLargeTitle: true }}
      />

      <ProfileStack.Screen
        name="ManagerApprovals"
        component={ManagerApprovalsScreen}
        options={{ title: vi.approvals, headerLargeTitle: true }}
      />

      <ProfileStack.Screen name="Notifications" component={InAppNotificationsScreen} options={{ title: vi.notifications }} />

      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: vi.settings, headerLargeTitle: true }} />

      <ProfileStack.Screen name="Scope" component={ScopeScreen} options={{ title: vi.scope }} />

      <ProfileStack.Screen name="Contracts" component={ContractsScreen} options={{ title: vi.contracts, headerLargeTitle: true }} />

      <ProfileStack.Screen name="Operations" component={OperationsScreen} options={{ title: vi.operations }} />

      <ProfileStack.Screen name="UpdateRequests" component={UpdateRequestsScreen} options={{ title: vi.requests, headerLargeTitle: true }} />

      <ProfileStack.Screen name="CreateUpdateRequest" component={CreateUpdateRequestScreen} options={{ title: vi.createRequest }} />

      <ProfileStack.Screen name="CreateLeaveRequest" component={CreateLeaveRequestScreen} options={{ title: vi.createLeave }} />

      <ProfileStack.Screen name="UpdateRequestDetail" component={UpdateRequestDetailScreen} options={{ title: vi.requestDetail }} />

      <ProfileStack.Screen name="LeaveRequestDetail" component={LeaveRequestDetailScreen} options={{ title: vi.leaveDetail }} />

      <ProfileStack.Screen name="Journey" component={JourneyScreen} options={{ title: vi.journey, headerLargeTitle: true }} />

    </ProfileStack.Navigator>

  );

}



function MainTabs() {

  const auth = useAuth();

  useForceHomeTabOnResize();
  useQaMatrixHomeLock();

  const insets = useSafeAreaInsets();

  const bottomInset = resolveBottomSafeInset(insets.bottom);

  const tabBarHeight = resolveTabBarHeight({ bottom: insets.bottom });

  const [managerBadge, setManagerBadge] = useState<number | undefined>(undefined);



  useEffect(() => {

    if (!auth.signedIn || !auth.isManager) {

      setManagerBadge(undefined);

      return;

    }

    let cancelled = false;

    const refreshBadge = async () => {

      const cid = auth.getAttendanceCompanyId();

      const mid = auth.employeeId.trim();

      if (!cid || !mid) {

        if (!cancelled) setManagerBadge(undefined);

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

        setManagerBadge(n > 0 ? n : undefined);

      } else {

        setManagerBadge(undefined);

      }

    };

    void refreshBadge();

    const id = setInterval(() => void refreshBadge(), 90_000);

    return () => {

      cancelled = true;

      clearInterval(id);

    };

  }, [auth.signedIn, auth.isManager, auth.companyUuid, auth.companyId, auth.employeeId, auth.accessToken]);



  const [homeTab, teamTab, payslipTab, profileTab] = MAIN_TAB_IA;



  return (

    <View style={{ flex: 1, backgroundColor: colors.background }}>

      <OfflineBanner />

      <OfflineSync />

      <Tab.Navigator

        initialRouteName={homeTab.key}

        screenOptions={{

          headerShown: false,

          lazy: false,

          tabBarActiveTintColor: colors.primary,

          tabBarInactiveTintColor: colors.textSecondary,

          tabBarStyle: {

            position: 'absolute',

            left: 0,

            right: 0,

            bottom: 0,

            backgroundColor: colors.surface,

            borderTopColor: colors.primary,

            borderTopWidth: brand.barWidth,

            height: tabBarHeight,

            paddingBottom: bottomInset,

            ...(Platform.OS === 'android' ? { elevation: 8 } : null),

          },

        }}

      >

        <Tab.Screen

          name={homeTab.key}

          component={DashboardScreen}

          options={{ title: homeTab.label, tabBarIcon: tabBarIcon(homeTab.icon, homeTab.iconOutline) }}

          listeners={({ navigation: tabNav }) => ({
            tabPress: () => {
              tabNav.navigate(homeTab.key, { _wmResizeEpoch: Date.now() });
            },
          })}

        />

        <Tab.Screen

          name={teamTab.key}

          component={AttendanceStack}

          options={{ title: teamTab.label, tabBarIcon: tabBarIcon(teamTab.icon, teamTab.iconOutline) }}

        />

        <Tab.Screen

          name={payslipTab.key}

          component={PayslipStackNavigator}

          options={{ title: payslipTab.label, tabBarIcon: tabBarIcon(payslipTab.icon, payslipTab.iconOutline) }}

        />

        <Tab.Screen

          name={profileTab.key}

          component={ProfileStackNavigator}

          options={{

            title: profileTab.label,

            tabBarIcon: tabBarIcon(profileTab.icon, profileTab.iconOutline),

            tabBarBadge: auth.isManager ? managerBadge : undefined,

          }}

        />

      </Tab.Navigator>

      <View
        testID={TAB_BAR_SAFE_ZONE_TEST_ID}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: bottomInset,
        }}
      />

      <CheckInFabOverlay managerPendingCount={managerBadge ?? 0} />

    </View>

  );

}



export function RootNavigator() {

  const auth = useAuth();



  if (!auth.hydrated) {

    return (

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>

        <ActivityIndicator size="large" color={colors.primary} />

      </View>

    );

  }



  return (

    <NavigationContainer

      theme={{

        ...DefaultTheme,

        colors: {

          ...DefaultTheme.colors,

          primary: colors.primary,

          background: colors.background,

          card: colors.surface,

          text: colors.text,

          border: colors.border,

          notification: colors.accent,

        },

      }}

    >

      <RootStack.Navigator screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>

        {!auth.signedIn ? (

          <RootStack.Screen name="Login" component={LoginScreen} options={{ title: vi.login, headerShown: false }} />

        ) : (

          <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />

        )}

      </RootStack.Navigator>

    </NavigationContainer>

  );

}

