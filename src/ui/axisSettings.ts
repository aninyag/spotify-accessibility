/** Axis (accessibility controls) onboarding + master toggle (session-only). */
export type AxisSettings = {
  isEnabled: boolean;
  hasSeenTutorial: boolean;
};

export const defaultAxisSettings: AxisSettings = {
  isEnabled: false,
  hasSeenTutorial: false,
};
