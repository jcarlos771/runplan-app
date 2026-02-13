import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivePlan, CompletedWorkout } from '@/data/types';
import { trainingPlans } from '@/data/plans';

const ACTIVE_PLAN_KEY = 'runplan_active_plan';

export function useActivePlan() {
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(ACTIVE_PLAN_KEY).then((data) => {
      if (data) setActivePlan(JSON.parse(data));
      setLoading(false);
    });
  }, []);

  const save = useCallback(async (plan: ActivePlan | null) => {
    if (plan) {
      await AsyncStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify(plan));
    } else {
      await AsyncStorage.removeItem(ACTIVE_PLAN_KEY);
    }
    setActivePlan(plan);
  }, []);

  const startPlan = useCallback(async (planId: string) => {
    const plan: ActivePlan = {
      planId,
      startDate: new Date().toISOString().split('T')[0],
      completedWorkouts: [],
    };
    await save(plan);
  }, [save]);

  const cancelPlan = useCallback(async () => {
    await save(null);
  }, [save]);

  const toggleWorkout = useCallback(async (weekNumber: number, day: number, notes?: string) => {
    if (!activePlan) return;
    const existing = activePlan.completedWorkouts.find(
      (w) => w.weekNumber === weekNumber && w.day === day
    );
    let updated: CompletedWorkout[];
    if (existing) {
      updated = activePlan.completedWorkouts.filter(
        (w) => !(w.weekNumber === weekNumber && w.day === day)
      );
    } else {
      updated = [
        ...activePlan.completedWorkouts,
        { planId: activePlan.planId, weekNumber, day, completedAt: new Date().toISOString(), notes },
      ];
    }
    await save({ ...activePlan, completedWorkouts: updated });
  }, [activePlan, save]);

  const isCompleted = useCallback((weekNumber: number, day: number) => {
    return activePlan?.completedWorkouts.some(
      (w) => w.weekNumber === weekNumber && w.day === day
    ) ?? false;
  }, [activePlan]);

  const getPlanData = useCallback(() => {
    if (!activePlan) return null;
    return trainingPlans.find((p) => p.id === activePlan.planId) ?? null;
  }, [activePlan]);

  const getCurrentWeek = useCallback(() => {
    if (!activePlan) return 1;
    const start = new Date(activePlan.startDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(Math.floor(diffDays / 7) + 1, getPlanData()?.weeks ?? 1));
  }, [activePlan, getPlanData]);

  return {
    activePlan,
    loading,
    startPlan,
    cancelPlan,
    toggleWorkout,
    isCompleted,
    getPlanData,
    getCurrentWeek,
  };
}
