import { Ionicons } from '@expo/vector-icons';

import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme/tokens';

import { HrmAvatar } from './HrmAvatar';

import { StatusBadge } from './StatusBadge';



type LeaveHeroCardProps = {

  employeeName: string;

  employeeCode: string;

  department?: string | null;

  status: string;

  avatarUrl?: string | null;

  baseUrl?: string;

};



export function LeaveHeroCard({

  employeeName,

  employeeCode,

  department,

  status,

  avatarUrl,

  baseUrl,

}: LeaveHeroCardProps) {

  const dept = department?.trim() || '—';



  return (

    <View style={styles.hero} accessibilityRole="summary">

      <HrmAvatar size={48} fullName={employeeName} avatarUrl={avatarUrl} baseUrl={baseUrl} />

      <View style={styles.textCol}>

        <Text style={styles.name} numberOfLines={2}>

          {employeeName}

        </Text>

        <Text style={styles.meta} numberOfLines={2}>

          {employeeCode} · {dept}

        </Text>

      </View>

      <StatusBadge status={status} />

    </View>

  );

}



const styles = StyleSheet.create({

  hero: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.md,

    backgroundColor: colors.background,

    borderRadius: radius.card,

    padding: spacing.md,

    borderWidth: 1,

    borderColor: colors.border,

  },

  textCol: { flex: 1, gap: 4 },

  name: {

    fontSize: typography.fontSize.title3,

    fontWeight: typography.fontWeight.semibold,

    color: colors.text,

    lineHeight: typography.lineHeight.title3,

  },

  meta: {

    fontSize: typography.fontSize.callout,

    color: colors.textSecondary,

    lineHeight: typography.lineHeight.callout,

  },

});


