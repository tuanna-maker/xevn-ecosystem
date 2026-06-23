import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { resolveLeaveTypeColor, resolveLeaveTypeLabel } from '../../i18n/leaveTypes';

import { colors, spacing, typography } from '../../theme/tokens';



export type DetailMetric = {

  label: string;

  value: string;

  /** When set, renders colored leave-type chip instead of plain value text. */

  leaveTypeCode?: string;

};



type DetailMetricGridProps = {

  metrics: DetailMetric[];

};



export function DetailMetricGrid({ metrics }: DetailMetricGridProps) {

  return (

    <View style={styles.grid} accessibilityRole="summary">

      {metrics.map((m) => (

        <View key={m.label} style={styles.cell}>

          <Text style={styles.label}>{m.label}</Text>

          {m.leaveTypeCode ? (

            <View

              style={[

                styles.chip,

                { backgroundColor: resolveLeaveTypeColor(m.leaveTypeCode) },

              ]}

              accessibilityLabel={resolveLeaveTypeLabel(m.leaveTypeCode)}

            >

              <Text style={styles.chipText}>{resolveLeaveTypeLabel(m.leaveTypeCode)}</Text>

            </View>

          ) : (

            <Text style={styles.value}>{m.value}</Text>

          )}

        </View>

      ))}

    </View>

  );

}



const styles = StyleSheet.create({

  grid: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: spacing.md,

  },

  cell: {

    width: '47%',

    gap: 4,

  },

  label: {

    fontSize: typography.fontSize.footnote,

    color: colors.textSecondary,

    fontWeight: typography.fontWeight.medium,

    lineHeight: typography.lineHeight.footnote,

  },

  value: {

    fontSize: typography.fontSize.body,

    fontWeight: typography.fontWeight.semibold,

    color: colors.text,

    lineHeight: typography.lineHeight.body,

  },

  chip: {

    alignSelf: 'flex-start',

    paddingHorizontal: spacing.sm,

    paddingVertical: 4,

    borderRadius: 999,

  },

  chipText: {

    color: colors.surface,

    fontSize: typography.fontSize.callout,

    fontWeight: typography.fontWeight.semibold,

  },

});


