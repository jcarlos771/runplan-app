import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import { usePlan } from '@/data/PlanContext';
import { useMemo } from 'react';

const motivationalMessages = [
  { threshold: 0, msg: '¡El primer paso es empezar! 💪', icon: 'rocket-outline' as const },
  { threshold: 10, msg: '¡Ya estás en marcha! Sigue así 🔥', icon: 'flame-outline' as const },
  { threshold: 25, msg: '¡Un cuarto del camino! Vas genial 🎯', icon: 'trophy-outline' as const },
  { threshold: 50, msg: '¡Medio plan completado! Eres imparable 🚀', icon: 'rocket-outline' as const },
  { threshold: 75, msg: '¡La recta final! No pares ahora 🏃', icon: 'medal-outline' as const },
  { threshold: 90, msg: '¡Casi lo logras! Un último empujón 🎉', icon: 'star-outline' as const },
  { threshold: 100, msg: '¡PLAN COMPLETADO! Eres una máquina 🏆', icon: 'trophy-outline' as const },
];

function StatCard({ icon, label, value, color, theme }: { icon: string; label: string; value: string; color: string; theme: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const theme = useTheme();
  const { activePlan, getPlanData, getCurrentWeek } = usePlan();
  const plan = getPlanData();

  const stats = useMemo(() => {
    if (!activePlan || !plan) return null;
    const totalWorkouts = plan.schedule.reduce((s, w) => s + w.workouts.filter((wo) => wo.type !== 'rest').length, 0);
    const completed = activePlan.completedWorkouts.length;
    const pct = Math.round((completed / Math.max(totalWorkouts, 1)) * 100);

    // Streak
    const completedDates = activePlan.completedWorkouts
      .map((w) => new Date(w.completedAt).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    let streak = 0;
    const todayStr = new Date().toDateString();
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const ds = d.toDateString();
      if (completedDates.includes(ds) || (i === 0 && !completedDates.includes(todayStr))) {
        if (i === 0 && !completedDates.includes(todayStr)) { d.setDate(d.getDate() - 1); continue; }
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }

    // Weekly volume (last 4 weeks)
    const currentWeek = getCurrentWeek();
    const weeklyData = [];
    for (let wk = Math.max(1, currentWeek - 3); wk <= currentWeek; wk++) {
      const weekSchedule = plan.schedule.find((w) => w.weekNumber === wk);
      const weekCompleted = activePlan.completedWorkouts.filter((w) => w.weekNumber === wk).length;
      const weekTotal = weekSchedule ? weekSchedule.workouts.filter((w) => w.type !== 'rest').length : 0;
      weeklyData.push({ week: wk, completed: weekCompleted, total: weekTotal });
    }

    return { totalWorkouts, completed, pct, streak, weeklyData };
  }, [activePlan, plan, getCurrentWeek]);

  if (!stats || !plan) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.background }]}>
        <Ionicons name="stats-chart-outline" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin datos</Text>
        <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>Activa un plan y completa entrenamientos</Text>
      </View>
    );
  }

  const message = [...motivationalMessages].reverse().find((m) => stats.pct >= m.threshold) ?? motivationalMessages[0];
  const maxBar = Math.max(...stats.weeklyData.map((w) => w.total), 1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      {/* Motivation */}
      <View style={[styles.motivCard, { backgroundColor: Colors.primary }]}>
        <Ionicons name={message.icon} size={32} color="#fff" />
        <Text style={styles.motivText}>{message.msg}</Text>
        <Text style={styles.motivPct}>{stats.pct}%</Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard icon="checkmark-done" label="Completados" value={`${stats.completed}/${stats.totalWorkouts}`} color={Colors.primary} theme={theme} />
        <StatCard icon="flame" label="Racha" value={`${stats.streak} días`} color={Colors.accent} theme={theme} />
        <StatCard icon="calendar" label="Semana" value={`${getCurrentWeek()}/${plan.weeks}`} color="#3B82F6" theme={theme} />
        <StatCard icon="trending-up" label="Progreso" value={`${stats.pct}%`} color="#8B5CF6" theme={theme} />
      </View>

      {/* Weekly chart */}
      <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Volumen semanal</Text>
        <View style={styles.chart}>
          {stats.weeklyData.map((w) => (
            <View key={w.week} style={styles.barCol}>
              <View style={styles.barContainer}>
                <View style={[styles.barTotal, { height: `${(w.total / maxBar) * 100}%` }]} />
                <View style={[styles.barDone, { height: `${(w.completed / maxBar) * 100}%` }]} />
              </View>
              <Text style={[styles.barLabel, { color: theme.textSecondary }]}>S{w.week}</Text>
              <Text style={[styles.barValue, { color: theme.text }]}>{w.completed}/{w.total}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Progress ring (simple) */}
      <View style={[styles.ringCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Plan completo</Text>
        <View style={styles.ringContainer}>
          <View style={[styles.ringBg]}>
            <View style={[styles.ringInner, { backgroundColor: theme.card }]}>
              <Text style={[styles.ringPct, { color: Colors.primary }]}>{stats.pct}%</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: 16 },
  emptyDesc: { fontSize: 15, textAlign: 'center', marginTop: 8 },
  motivCard: { borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  motivText: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
  motivPct: { color: '#fff', fontSize: 28, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '47%', borderRadius: 14, padding: 14, borderWidth: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  chart: { flexDirection: 'row', justifyContent: 'space-around', height: 120 },
  barCol: { alignItems: 'center', flex: 1 },
  barContainer: { flex: 1, width: 24, justifyContent: 'flex-end', marginBottom: 4 },
  barTotal: { width: '100%', backgroundColor: '#E5E7EB', borderRadius: 4, position: 'absolute', bottom: 0 },
  barDone: { width: '100%', backgroundColor: Colors.primary, borderRadius: 4, position: 'absolute', bottom: 0 },
  barLabel: { fontSize: 11, fontWeight: '600' },
  barValue: { fontSize: 10, fontWeight: '500' },
  ringCard: { borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center' },
  ringContainer: { marginTop: 8 },
  ringBg: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 28, fontWeight: '800' },
});
