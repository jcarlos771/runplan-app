import { TrainingPlan, Week, Workout } from './types';

function w(day: number, type: Workout['type'], title: string, description: string, opts: Partial<Workout> = {}): Workout {
  return { day, type, title, description, intensity: 'low', ...opts };
}

const rest = (day: number): Workout => w(day, 'rest', 'Descanso', 'Día de descanso activo. Estira y recupérate.');
const cross = (day: number, dur: number): Workout => w(day, 'cross', 'Cross-training', `${dur} min de actividad cruzada: bici, natación o yoga.`, { duration: dur, intensity: 'low' });

// ─── Couch to 5K (8 weeks) ──────────────────────────────────────
const c25k: Week[] = Array.from({ length: 8 }, (_, i) => {
  const wk = i + 1;
  const runMin = Math.min(10 + i * 4, 30);
  const walkMin = Math.max(20 - i * 3, 0);
  const desc = walkMin > 0
    ? `Alterna ${runMin} min corriendo con ${walkMin} min caminando`
    : `Corre ${runMin} min continuos`;
  return {
    weekNumber: wk,
    label: `Semana ${wk}`,
    workouts: [
      w(1, 'easy', 'Carrera/Caminata', desc, { duration: runMin + walkMin, intensity: 'low' }),
      rest(2),
      w(3, 'easy', 'Carrera/Caminata', desc, { duration: runMin + walkMin, intensity: 'low' }),
      rest(4),
      w(5, 'easy', 'Carrera/Caminata', desc, { duration: runMin + walkMin, intensity: 'low' }),
      rest(6),
      wk >= 5
        ? w(7, 'longRun', 'Carrera larga', `Corre ${runMin + 5} min a ritmo suave`, { duration: runMin + 5, intensity: 'low' })
        : rest(7),
    ],
  };
});

// ─── 5K Improve (6 weeks) ───────────────────────────────────────
const fiveKImprove: Week[] = Array.from({ length: 6 }, (_, i) => {
  const wk = i + 1;
  return {
    weekNumber: wk,
    label: `Semana ${wk}`,
    workouts: [
      w(1, 'easy', 'Carrera suave', `${25 + wk} min a ritmo cómodo`, { duration: 25 + wk, intensity: 'low' }),
      rest(2),
      w(3, 'tempo', 'Tempo', `10 min calentamiento + ${10 + wk * 2} min a ritmo tempo + 10 min vuelta a la calma`, { duration: 30 + wk * 2, intensity: 'moderate' }),
      rest(4),
      w(5, 'intervals', 'Intervalos', `8x400m a ritmo rápido con 90s recuperación`, { duration: 35, intensity: 'high' }),
      rest(6),
      w(7, 'longRun', 'Carrera larga', `${6 + wk} km a ritmo suave`, { distance: 6 + wk, intensity: 'low' }),
    ],
  };
});

// ─── 10K Beginner (8 weeks) ─────────────────────────────────────
const tenKBeginner: Week[] = Array.from({ length: 8 }, (_, i) => {
  const wk = i + 1;
  return {
    weekNumber: wk,
    label: `Semana ${wk}`,
    workouts: [
      w(1, 'easy', 'Carrera suave', `${30 + wk} min fácil`, { duration: 30 + wk, intensity: 'low' }),
      rest(2),
      w(3, 'tempo', 'Tempo', `${15 + wk} min a ritmo tempo`, { duration: 25 + wk, intensity: 'moderate' }),
      w(4, 'easy', 'Carrera suave', `25 min recuperación`, { duration: 25, intensity: 'low' }),
      rest(5),
      cross(6, 30),
      w(7, 'longRun', 'Carrera larga', `${6 + wk} km a ritmo suave`, { distance: 6 + wk, intensity: 'low' }),
    ],
  };
});

// ─── 10K Intermediate (10 weeks) ────────────────────────────────
const tenKIntermediate: Week[] = Array.from({ length: 10 }, (_, i) => {
  const wk = i + 1;
  return {
    weekNumber: wk,
    label: `Semana ${wk}`,
    workouts: [
      w(1, 'easy', 'Carrera suave', `${35 + wk} min fácil`, { duration: 35 + wk, intensity: 'low' }),
      w(2, 'intervals', 'Intervalos', `10x400m rápido + 60s descanso`, { duration: 40, intensity: 'high' }),
      rest(3),
      w(4, 'tempo', 'Tempo', `${20 + wk} min a ritmo tempo`, { duration: 30 + wk, intensity: 'moderate' }),
      w(5, 'easy', 'Carrera suave', `30 min recuperación`, { duration: 30, intensity: 'low' }),
      rest(6),
      w(7, 'longRun', 'Carrera larga', `${8 + wk} km a ritmo suave`, { distance: 8 + wk, intensity: 'low' }),
    ],
  };
});

// ─── Half Marathon (12 weeks) ───────────────────────────────────
const halfMarathon: Week[] = Array.from({ length: 12 }, (_, i) => {
  const wk = i + 1;
  const longKm = Math.min(10 + wk * 1, 20);
  const isTaper = wk >= 11;
  return {
    weekNumber: wk,
    label: `Semana ${wk}${isTaper ? ' (Taper)' : ''}`,
    workouts: [
      w(1, 'easy', 'Carrera suave', `${isTaper ? 25 : 35 + wk} min fácil`, { duration: isTaper ? 25 : 35 + wk, intensity: 'low' }),
      w(2, 'intervals', 'Intervalos', `${isTaper ? '4' : '6'}x800m rápido`, { duration: isTaper ? 30 : 40, intensity: isTaper ? 'moderate' : 'high' }),
      rest(3),
      w(4, 'tempo', 'Tempo', `${isTaper ? 15 : 20 + wk} min tempo`, { duration: isTaper ? 25 : 30 + wk, intensity: 'moderate' }),
      wk <= 10 ? w(5, 'easy', 'Carrera suave', '30 min fácil', { duration: 30, intensity: 'low' }) : rest(5),
      rest(6),
      w(7, 'longRun', 'Carrera larga', `${isTaper ? Math.max(longKm - 6, 10) : longKm} km`, { distance: isTaper ? Math.max(longKm - 6, 10) : longKm, intensity: 'low' }),
    ],
  };
});

// ─── Marathon (16 weeks) ────────────────────────────────────────
const marathon: Week[] = Array.from({ length: 16 }, (_, i) => {
  const wk = i + 1;
  const longKm = Math.min(14 + wk * 1.3, 35);
  const isTaper = wk >= 14;
  return {
    weekNumber: wk,
    label: `Semana ${wk}${isTaper ? ' (Taper)' : ''}`,
    workouts: [
      w(1, 'easy', 'Carrera suave', `${isTaper ? 30 : 40 + wk} min fácil`, { duration: isTaper ? 30 : 40 + wk, intensity: 'low' }),
      w(2, 'intervals', 'Intervalos', `${isTaper ? '4' : '8'}x800m rápido`, { duration: isTaper ? 30 : 45, intensity: isTaper ? 'moderate' : 'high' }),
      w(3, 'easy', 'Carrera suave', '30 min fácil', { duration: 30, intensity: 'low' }),
      rest(4),
      w(5, 'tempo', 'Tempo', `${isTaper ? 15 : 20 + wk} min tempo`, { duration: isTaper ? 25 : 30 + wk, intensity: 'moderate' }),
      rest(6),
      w(7, 'longRun', 'Carrera larga', `${isTaper ? Math.round(longKm * 0.6) : Math.round(longKm)} km`, { distance: isTaper ? Math.round(longKm * 0.6) : Math.round(longKm), intensity: 'low' }),
    ],
  };
});

export const trainingPlans: TrainingPlan[] = [
  {
    id: 'c25k',
    name: 'Couch to 5K',
    subtitle: 'De cero a 5K',
    description: 'Programa de 8 semanas para empezar a correr desde cero. Progresa de caminata/carrera a carrera continua de 5K.',
    weeks: 8,
    difficulty: 'beginner',
    weeklyRuns: '3-4 carreras',
    weeklyVolume: '60-120 min',
    schedule: c25k,
  },
  {
    id: '5k-improve',
    name: 'Mejorar 5K',
    subtitle: 'Mejora tu marca',
    description: 'Plan de 6 semanas con tempo e intervalos para mejorar tu tiempo en 5K. Requiere base de carrera continua.',
    weeks: 6,
    difficulty: 'intermediate',
    weeklyRuns: '3-4 carreras',
    weeklyVolume: '90-150 min',
    schedule: fiveKImprove,
  },
  {
    id: '10k-beginner',
    name: '10K Principiante',
    subtitle: 'Tu primer 10K',
    description: 'Programa de 8 semanas para completar tus primeros 10K. Parte de una base de 5K.',
    weeks: 8,
    difficulty: 'beginner',
    weeklyRuns: '4 carreras',
    weeklyVolume: '120-180 min',
    schedule: tenKBeginner,
  },
  {
    id: '10k-intermediate',
    name: '10K Intermedio',
    subtitle: 'Velocidad y resistencia',
    description: 'Plan de 10 semanas con trabajo de velocidad para mejorar tu marca en 10K.',
    weeks: 10,
    difficulty: 'intermediate',
    weeklyRuns: '5 carreras',
    weeklyVolume: '150-240 min',
    schedule: tenKIntermediate,
  },
  {
    id: 'half-marathon',
    name: 'Media Maratón',
    subtitle: '21.1 km',
    description: 'Plan de 12 semanas para completar una media maratón. Incluye progresión de carrera larga hasta 18-20 km con fase de taper.',
    weeks: 12,
    difficulty: 'intermediate',
    weeklyRuns: '4-5 carreras',
    weeklyVolume: '180-300 min',
    schedule: halfMarathon,
  },
  {
    id: 'marathon',
    name: 'Maratón',
    subtitle: '42.195 km',
    description: 'Plan de 16 semanas para completar un maratón. Carrera larga hasta 32-35 km con periodización y taper final.',
    weeks: 16,
    difficulty: 'advanced',
    weeklyRuns: '5 carreras',
    weeklyVolume: '240-420 min',
    schedule: marathon,
  },
];
