import React, { createContext, useContext } from 'react';
import { useActivePlan } from '@/hooks/useActivePlan';

type PlanContextType = ReturnType<typeof useActivePlan>;

const PlanContext = createContext<PlanContextType | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const plan = useActivePlan();
  return <PlanContext.Provider value={plan}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
