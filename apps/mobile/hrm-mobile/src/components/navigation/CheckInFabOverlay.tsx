import { Ionicons } from '@expo/vector-icons';

import React, { useCallback, useMemo, useState } from 'react';

import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { useAuth } from '../../context/AuthContext';

import {

  CHECK_IN_FAB_FILL,

  CHECK_IN_FAB_ICON_SIZE,

  CHECK_IN_FAB_PRESSED_FILL,

  CHECK_IN_FAB_SIZE,

  CHECK_IN_FAB_TEST_ID,

  resolveCheckInFabBottom,
  resolveDeepestFocusedRouteName,
  shouldHideCheckInFab,

} from '../../navigation/checkInFab';

import { CHECK_IN_FAB_ACCESSIBILITY_LABEL, resolveFabPrimaryActions } from '../../navigation/fabPrimaryActions';
import { resolveMobilePersona } from '../../utils/mobilePersona';

import { radius, shadow } from '../../theme/tokens';

import { FabPrimaryActionSheet } from './FabPrimaryActionSheet';



type CheckInFabOverlayProps = {

  /** Manager pending count for FAB sheet badge — synced from MainTabs tab badge poll. */

  managerPendingCount?: number;

};



export function CheckInFabOverlay({ managerPendingCount = 0 }: CheckInFabOverlayProps) {

  const insets = useSafeAreaInsets();

  const auth = useAuth();

  const bottom = resolveCheckInFabBottom(insets);

  const focusedRouteName = useNavigationState(resolveDeepestFocusedRouteName);

  const hideFab = shouldHideCheckInFab(focusedRouteName);

  const [sheetOpen, setSheetOpen] = useState(false);



  const persona = useMemo(
    () =>
      resolveMobilePersona({
        roles: auth.roles,
        companyId: auth.companyId,
        memberships: auth.memberships,
        jobTitleKey: auth.jobTitleKey,
        summaryIsManager: auth.summaryIsManager,
      }),
    [auth.roles, auth.companyId, auth.memberships, auth.jobTitleKey, auth.summaryIsManager],
  );

  const actions = useMemo(
    () =>
      resolveFabPrimaryActions({
        persona,
        managerPendingCount,
      }),
    [persona, managerPendingCount],
  );



  const onFabPress = useCallback(() => {

    setSheetOpen(true);

  }, []);



  const onCloseSheet = useCallback(() => {

    setSheetOpen(false);

  }, []);



  if (hideFab) {
    return null;
  }

  return (

    <>

      <View pointerEvents="box-none" style={StyleSheet.absoluteFill} accessibilityElementsHidden={false}>

        <Pressable

          testID={CHECK_IN_FAB_TEST_ID}

          accessibilityRole="button"

          accessibilityLabel={CHECK_IN_FAB_ACCESSIBILITY_LABEL}

          onPress={onFabPress}

          style={({ pressed }) => [

            styles.fab,

            { bottom },

            pressed ? styles.fabPressed : null,

          ]}

        >

          <Ionicons name="add" size={CHECK_IN_FAB_ICON_SIZE} color="#FFFFFF" />

        </Pressable>

      </View>

      <FabPrimaryActionSheet visible={sheetOpen} actions={actions} onClose={onCloseSheet} />

    </>

  );

}



const styles = StyleSheet.create({

  fab: {

    position: 'absolute',

    alignSelf: 'center',

    width: CHECK_IN_FAB_SIZE,

    height: CHECK_IN_FAB_SIZE,

    borderRadius: radius.full,

    backgroundColor: CHECK_IN_FAB_FILL,

    alignItems: 'center',

    justifyContent: 'center',

    ...(Platform.OS === 'android' ? { elevation: 6 } : shadow.soft),

  },

  fabPressed: {

    backgroundColor: CHECK_IN_FAB_PRESSED_FILL,

    transform: [{ scale: 0.96 }],

  },

});

