import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '@/constants/Colors';
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

function StatCard({ icon, label, value, color, theme, index }: { icon: string; label: string; value: string; color: string; theme: any; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </Animated.View>
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

    const completedDates = activePlan.completedWorkouts
      .map((w) => new Date(w.completedAt).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    let streak = 0;
    const d = new Date();
    const todayStr = d.toDateString();
    for (let i = 0; i < 365; i++) {
      const ds = d.toDateString();
      if (completedDates.includes(ds) || (i === 0 && !completedDates.includes(todayStr))) {
        if (i === 0 && !completedDates.includes(todayStr)) { d.setDate(d.getDate() - 1); continue; }
        streak++; d.setDate(d.getDate() - 1);
      } else break;
    }

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
        <Text style={{ fontSize: 64 }}>📊</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin datos aún</Text>
        <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>Activa un plan y completa entrenamientos para ver tu progreso</Text>
      </View>
    );
  }

  const message = [...motivationalMessages].reverse().find((m) => stats.pct >= m.threshold) ?? motivationalMessages[0];
  const maxBar = Math.max(...stats.weeklyData.map((w) => w.total), 1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.motivCard, Shadow.md]}>
        <Ionicons name={message.icon} size={36} color="#fff" />
        <Text style={styles.motivText}>{message.msg}</Text>
        <Text style={styles.motivPct}>{stats.pct}%</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="checkmark-done" label="Completados" value={`${stats.completed}/${stats.totalWorkouts}`} color={Colors.primary} theme={theme} index={0} />
        <StatCard icon="flame" label="Racha" value={`${stats.streak} días`} color={Colors.accent} theme={theme} index={1} />
        <StatCard icon="calendar" label="Semana" value={`${getCurrentWeek()}/${plan.weeks}`} color="#3B82F6" theme={theme} index={2} />
        <StatCard icon="trending-up" label="Progreso" value={`${stats.pct}%`} color="#8B5CF6" theme={theme} index={3} />
      </View>

      <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>📊 Volumen semanal</Text>
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

      <View style={[styles.ringCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>🎯 Plan completo</Text>
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
  content: { padding: Spacing.md, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 24, fontWeight: '800', marginTop: Spacing.md },
  emptyDesc: { fontSize: 15, textAlign: 'center', marginTop: Spacing.sm },
  motivCard: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  motivText: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 22 },
  motivPct: { color: '#fff', fontSize: 32, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.md },
  statCard: { width: '47%', borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  statIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  chartCard: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  chartTitle: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.md },
  chart: { flexDirection: 'row', justifyContent: 'space-around', height: 120 },
  barCol: { alignItems: 'center', flex: 1 },
  barContainer: { flex: 1, width: 28, justifyContent: 'flex-end', marginBottom: 4, borderRadius: 4, overflow: 'hidden' },
  barTotal: { width: '100%', backgroundColor: '#E5E7EB', borderRadius: 4, position: 'absolute', bottom: 0 },
  barDone: { width: '100%', backgroundColor: Colors.primary, borderRadius: 4, position: 'absolute', bottom: 0 },
  barLabel: { fontSize: 12, fontWeight: '700' },
  barValue: { fontSize: 10, fontWeight: '500' },
  ringCard: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, alignItems: 'center' },
  ringContainer: { marginTop: Spacing.sm },
  ringBg: { width: 130, height: 130, borderRadius: 65, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 30, fontWeight: '800' },
});
