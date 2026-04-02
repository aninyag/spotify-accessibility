/** Persisted Axis (accessibility controls) onboarding + master toggle. */
export type AxisSettings = {
  isEnabled: boolean;
  hasSeenTutorial: boolean;
  hasDismissedCard: boolean;
};

export const defaultAxisSettings: AxisSettings = {
  isEnabled: false,
  hasSeenTutorial: false,
  hasDismissedCard: false,
};
