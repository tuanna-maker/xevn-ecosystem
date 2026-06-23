import { TabActions, useNavigation } from '@react-navigation/native';

import { useEffect } from 'react';



import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';



import { isQaDeepLinkLoginEnabled } from '../config/qaLogin';

import { useAuth } from '../context/AuthContext';

import type { MainTabParamList } from './types';



/**

 * MOB-UX-14-R7 — qa-device matrix adb can read Payslip tab before Home paints after wm resize.

 * QA APK only: pin TabDashboard briefly after sign-in so 14d scrollDepth probes Home tree.

 */

export function useQaMatrixHomeLock(): void {

  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const { signedIn } = useAuth();



  useEffect(() => {

    if (!isQaDeepLinkLoginEnabled() || !signedIn) return;



    const focusHome = () => {

      navigation.dispatch(TabActions.jumpTo('TabDashboard'));

    };



    // Single pin after deep-link — repeat jumpTo fought Profile-stack tile nav (R-W7-MOB-LEAVE-NAV-01-R2).
    focusHome();

    return undefined;

  }, [navigation, signedIn]);

}


