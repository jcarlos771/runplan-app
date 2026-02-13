import { WorkoutType } from '@/constants/Colors';

export interface Workout {
  day: number; // 1-7 (Mon-Sun)
  type: WorkoutType;
  title: string;
  description: string;
  duration?: number; // minutes
  distance?: number; // km
  intensity: 'low' | 'moderate' | 'high';
}

export interface Week {
  weekNumber: number;
  label: string;
  workouts: Workout[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  weeks: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  weeklyRuns: string;
  weeklyVolume: string;
  schedule: Week[];
}

export interface CompletedWorkout {
  planId: string;
  weekNumber: number;
  day: number;
  completedAt: string;
  notes?: string;
}

export interface ActivePlan {
  planId: string;
  startDate: string; // ISO date
  completedWorkouts: CompletedWorkout[];
}
