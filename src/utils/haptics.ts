import * as Haptics from 'expo-haptics';

let lastClickTime = 0;
const CLICK_THROTTLE = 300; // milliseconds

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
  await Haptics.impactAsync(style);
  return true;
};

/**
 * Trigger notification haptic feedback (without throttling)
 */
export const triggerNotificationHaptic = async (
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
): Promise<void> => {
  await Haptics.notificationAsync(type);
};

/**
 * Trigger selection haptic feedback (without throttling)
 */
export const triggerSelectionHaptic = async (): Promise<void> => {
  await Haptics.selectionAsync();
};

// Re-export types for convenience
export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
