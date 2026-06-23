import { CommonActions, useNavigation } from '@react-navigation/native';

import { useEffect, useRef } from 'react';

import { InteractionManager, useWindowDimensions } from 'react-native';



import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';



import { useAuth } from '../context/AuthContext';

import type { MainTabParamList } from './types';



function focusHomeTab(navigation: BottomTabNavigationProp<MainTabParamList>, epoch: number): void {

  navigation.dispatch(

    CommonActions.navigate({

      name: 'TabDashboard',

      params: { _wmResizeEpoch: epoch },

    }),

  );

  if ('jumpTo' in navigation && typeof navigation.jumpTo === 'function') {

    navigation.jumpTo('TabDashboard');

  }

}



/**

 * MOB-UX-14-R7 — adb `wm size` can leave Payslip tab focused or Home tree unpainted.

 * Focus TabDashboard on login, first mount, and after dimension changes (delayed for adb matrix).

 */

export function useForceHomeTabOnResize(): void {

  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const { signedIn } = useAuth();

  const { width, height } = useWindowDimensions();

  const lastViewport = useRef<{ width: number; height: number } | null>(null);

  const loginFocusedRef = useRef(false);



  useEffect(() => {

    if (!signedIn) {

      loginFocusedRef.current = false;

      return;

    }

    if (loginFocusedRef.current) return;

    loginFocusedRef.current = true;



    const epoch = Date.now();

    const task = InteractionManager.runAfterInteractions(() => {

      focusHomeTab(navigation, epoch);

      setTimeout(() => focusHomeTab(navigation, epoch + 1), 1200);

      setTimeout(() => focusHomeTab(navigation, epoch + 2), 2800);

    });



    return () => task.cancel();

  }, [navigation, signedIn]);



  useEffect(() => {

    if (!signedIn) return;



    const prev = lastViewport.current;

    const epoch = Date.now();



    if (!prev) {

      lastViewport.current = { width, height };

      return;

    }



    if (prev.width === width && prev.height === height) return;

    lastViewport.current = { width, height };



    const task = InteractionManager.runAfterInteractions(() => {

      focusHomeTab(navigation, epoch);

      setTimeout(() => focusHomeTab(navigation, epoch + 1), 1200);

    });



    return () => task.cancel();

  }, [width, height, navigation, signedIn]);

}


