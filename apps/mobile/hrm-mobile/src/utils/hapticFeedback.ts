/** Light haptic when a swipe row opens — safe no-op on web/simulator. */
export async function triggerSwipeOpenHaptic(): Promise<void> {
  try {
    const Haptics = await import('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Simulator / missing native module — non-blocking
  }
}
