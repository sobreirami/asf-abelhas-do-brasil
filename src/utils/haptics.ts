import * as Haptics from 'expo-haptics';

let lastClickTime = 0;
const CLICK_THROTTLE = 300; // milliseconds

/**
 * Haptics are best-effort feedback: a rejected native call must never block
 * the action (navigation, closing a modal…) that callers run after awaiting it.
 */
async function runHaptic(effect: () => Promise<void>): Promise<void> {
  try {
    await effect();
  } catch (error) {
    if (__DEV__) console.warn('Haptics error:', error);
  }
}

/**
 * Trigger haptic feedback with double-click prevention
 * @param style Impact feedback style
 * @returns true if haptic was triggered, false if throttled
 */
export const triggerHaptic = async (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
): Promise<boolean> => {
  const now = Date.now();
  if (now - lastClickTime < CLICK_THROTTLE) {
    return false; // Click was throttled
  }
  lastClickTime = now;
  await runHaptic(() => Haptics.impactAsync(style));
  return true;
};

/**
 * Trigger notification haptic feedback (without throttling)
 */
export const triggerNotificationHaptic = async (
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
): Promise<void> => {
  await runHaptic(() => Haptics.notificationAsync(type));
};

/**
 * Trigger selection haptic feedback (without throttling)
 */
export const triggerSelectionHaptic = async (): Promise<void> => {
  await runHaptic(() => Haptics.selectionAsync());
};

// Re-export types for convenience
export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
