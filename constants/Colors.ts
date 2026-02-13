export const Colors = {
  primary: '#059669',
  primaryLight: '#10B981',
  primaryDark: '#047857',
  accent: '#F59E0B',
  accentLight: '#FBBF24',

  // Workout type colors
  workout: {
    easy: '#10B981',
    tempo: '#F59E0B',
    intervals: '#EF4444',
    longRun: '#3B82F6',
    rest: '#9CA3AF',
    cross: '#8B5CF6',
  },

  light: {
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    tabBar: '#FFFFFF',
    tabBarInactive: '#9CA3AF',
  },

  dark: {
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    tabBar: '#1F2937',
    tabBarInactive: '#6B7280',
  },
};

export type WorkoutType = 'easy' | 'tempo' | 'intervals' | 'longRun' | 'rest' | 'cross';

export const workoutTypeLabels: Record<WorkoutType, string> = {
  easy: 'Easy Run',
  tempo: 'Tempo',
  intervals: 'Intervals',
  longRun: 'Long Run',
  rest: 'Rest',
  cross: 'Cross-training',
};
