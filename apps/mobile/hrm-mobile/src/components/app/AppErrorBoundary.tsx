import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../../theme/tokens';

type AppErrorBoundaryProps = {
  resetKey: number;
  onRetry: () => void;
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.PureComponent<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      // Reset the boundary when the caller requests a retry/remount.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ hasError: false });
    }
  }

  componentDidCatch() {
    // Intentionally no logging here: release builds should not leak internal stacks to UI.
    // Native logging still captures the exception for diagnostics.
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.root} accessibilityRole="alert">
        <View style={styles.card}>
          <Text style={styles.title}>Ứng dụng gặp lỗi khi khởi động</Text>
          <Text style={styles.body}>
            Vui lòng thử lại. Nếu vẫn gặp, hãy cài lại APK hoặc gửi logcat để đội kỹ thuật kiểm tra.
          </Text>
          <Pressable
            onPress={this.props.onRetry}
            style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Thử lại"
          >
            <Text style={styles.buttonText}>Thử lại</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.layout.screenPaddingH,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.layout.cardPadding,
    ...tokens.shadow.soft,
  },
  title: {
    fontSize: tokens.typography.fontSize.title3,
    lineHeight: tokens.typography.lineHeight.title3,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text,
  },
  body: {
    marginTop: tokens.spacing.sm,
    fontSize: tokens.typography.fontSize.body,
    lineHeight: tokens.typography.lineHeight.body,
    fontWeight: tokens.typography.fontWeight.normal,
    color: tokens.colors.textSecondary,
  },
  button: {
    marginTop: tokens.spacing.lg,
    height: tokens.layout.primaryButtonHeight,
    borderRadius: tokens.radius.input,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: tokens.colors.primaryPressed,
  },
  buttonText: {
    fontSize: tokens.typography.fontSize.body,
    lineHeight: tokens.typography.lineHeight.body,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.surface,
  },
});

