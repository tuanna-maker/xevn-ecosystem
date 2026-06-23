import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ProfileCurrentTask } from '../../utils/profileTask';
import { colors, radius, spacing, textStyles, typography } from '../../theme/tokens';
import { StatusBadge } from '../ui/StatusBadge';
import { SurfaceCard } from '../ui/SurfaceCard';

type ProfileTaskCardProps = {
  task: ProfileCurrentTask;
};

/** ZenHR SET E — current task card with progress + priority — MOB-UX-09. */
export function ProfileTaskCard({ task }: ProfileTaskCardProps) {
  const progress = Math.min(100, Math.max(0, task.progress));
  return (
    <SurfaceCard title="Nhiệm vụ hiện tại" testID="profile-task-card">
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        <StatusBadge
          status={task.priority === 'high' ? 'pending' : 'approved'}
          label={task.priorityLabel}
          tone={task.priority === 'high' ? 'warning' : 'neutral'}
        />
      </View>
      {task.subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {task.subtitle}
        </Text>
      ) : null}
      <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ now: progress, min: 0, max: 100 }}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{progress}% hoàn thành</Text>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
  },
  subtitle: {
    ...textStyles.footnoteLabel,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  progressLabel: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
  },
});
