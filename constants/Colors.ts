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
  easy: 'Carrera suave',
  tempo: 'Tempo',
  intervals: 'Intervalos',
  longRun: 'Tirada larga',
  rest: 'Descanso',
  cross: 'Entrenamiento cruzado',
};

export const workoutTypeIcons: Record<WorkoutType, string> = {
  easy: '🏃',
  tempo: '💨',
  intervals: '⚡',
  longRun: '🏔️',
  rest: '🧘',
  cross: '🚴',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const REST_DAY_MESSAGES = [
  '🧘 Descansar es parte del entrenamiento',
  '💤 Tu cuerpo se hace más fuerte mientras descansas',
  '🌱 Hoy creces sin correr',
  '🛌 Los mejores atletas saben cuándo descansar',
  '✨ Recarga pilas para mañana',
  '🧠 Descanso activo: estira, camina, respira',
  '💪 El descanso previene lesiones',
  '🎯 Descansar hoy = rendir mejor mañana',
];
