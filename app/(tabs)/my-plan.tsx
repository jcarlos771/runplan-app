import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, workoutTypeLabels } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import { usePlan } from '@/data/PlanContext';
import { Workout } from '@/data/types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function MyPlanScreen() {
  const theme = useTheme();
  const { activePlan, getPlanData, getCurrentWeek, toggleWorkout, isCompleted, cancelPlan } = usePlan();
  const router = useRouter();
  const plan = getPlanData();

  if (!activePlan || !plan) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.background }]}>
        <Ionicons name="fitness-outline" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin plan activo</Text>
        <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
          Ve a la pestaña Planes y elige uno para empezar
        </Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.emptyBtnText}>Ver planes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentWeek = getCurrentWeek();
  const weekData = plan.schedule.find((w) => w.weekNumber === currentWeek);
  const totalWorkouts = plan.schedule.reduce((sum, w) => sum + w.workouts.filter((wo) => wo.type !== 'rest').length, 0);
  const completedCount = activePlan.completedWorkouts.length;
  const weekCompleted = weekData ? weekData.workouts.filter((wo) => wo.type !== 'rest' && isCompleted(currentWeek, wo.day)).length : 0;
  const weekTotal = weekData ? weekData.workouts.filter((wo) => wo.type !== 'rest').length : 0;

  const todayDow = new Date().getDay(); // 0=Sun
  const mappedDay = todayDow === 0 ? 7 : todayDow;
  const todayWorkout = weekData?.workouts.find((w) => w.day === mappedDay);

  const handleToggle = async (day: number) => {
    await toggleWorkout(currentWeek, day);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.planHeader, { backgroundColor: Colors.primary }]}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planWeek}>Semana {currentWeek} de {plan.weeks}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.round((completedCount / Math.max(totalWorkouts, 1)) * 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round((completedCount / Math.max(totalWorkouts, 1)) * 100)}% completado</Text>
      </View>

      {todayWorkout && (
        <View style={[styles.todayCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.todayLabel, { color: Colors.primary }]}>HOY</Text>
          <Text style={[styles.todayTitle, { color: theme.text }]}>{todayWorkout.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: Colors.workout[todayWorkout.type] + '20' }]}>
            <Text style={{ color: Colors.workout[todayWorkout.type], fontWeight: '600', fontSize: 12 }}>
              {workoutTypeLabels[todayWorkout.type]}
            </Text>
          </View>
          <Text style={[styles.todayDesc, { color: theme.textSecondary }]}>{todayWorkout.description}</Text>
          <TouchableOpacity
            style={[styles.completeBtn, isCompleted(currentWeek, mappedDay) && styles.completeBtnDone]}
            onPress={() => handleToggle(mappedDay)}
          >
            <Ionicons name={isCompleted(currentWeek, mappedDay) ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} color="#fff" />
            <Text style={styles.completeBtnText}>
              {isCompleted(currentWeek, mappedDay) ? '¡Completado!' : 'Marcar completado'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.weekCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.weekHeader}>
          <Text style={[styles.weekTitle, { color: theme.text }]}>Semana {currentWeek}</Text>
          <Text style={[styles.weekProgress, { color: theme.textSecondary }]}>{weekCompleted}/{weekTotal}</Text>
        </View>
        <View style={styles.weekBarBg}>
          <View style={[styles.weekBarFill, { width: `${Math.round((weekCompleted / Math.max(weekTotal, 1)) * 100)}%` }]} />
        </View>
        {weekData?.workouts.map((wo, i) => {
          const done = isCompleted(currentWeek, wo.day);
          const color = Colors.workout[wo.type];
          return (
            <TouchableOpacity
              key={i}
              style={[styles.workoutRow, done && styles.workoutRowDone]}
              onPress={wo.type !== 'rest' ? () => handleToggle(wo.day) : undefined}
              disabled={wo.type === 'rest'}
            >
              <View style={[styles.dayBadge, { backgroundColor: wo.day === mappedDay ? Colors.primary : theme.border }]}>
                <Text style={[styles.dayText, { color: wo.day === mappedDay ? '#fff' : theme.textSecondary }]}>
                  {dayNames[wo.day - 1]}
                </Text>
              </View>
              <View style={[styles.workoutDot, { backgroundColor: color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.workoutName, { color: theme.text }, done && styles.strikethrough]}>{wo.title}</Text>
                <Text style={[styles.workoutInfo, { color: theme.textSecondary }]}>
                  {wo.distance ? `${wo.distance} km` : wo.duration ? `${wo.duration} min` : ''}
                </Text>
              </View>
              {wo.type !== 'rest' && (
                <Ionicons
                  name={done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={done ? Colors.primary : theme.textSecondary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => Alert.alert('Cancelar plan', '¿Seguro que quieres abandonar este plan?', [
          { text: 'No', style: 'cancel' },
          { text: 'Sí, cancelar', style: 'destructive', onPress: cancelPlan },
        ])}
      >
        <Text style={styles.cancelText}>Abandonar plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: 16 },
  emptyDesc: { fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  emptyBtn: { marginTop: 24, backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  planHeader: { padding: 20, paddingTop: 16, paddingBottom: 24 },
  planName: { color: '#fff', fontSize: 24, fontWeight: '800' },
  planWeek: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4, marginBottom: 12 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  progressText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 6, fontWeight: '600' },
  todayCard: { margin: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  todayLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  todayTitle: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 6 },
  todayDesc: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  completeBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10, marginTop: 14 },
  completeBtnDone: { backgroundColor: Colors.primaryLight },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  weekCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekTitle: { fontSize: 18, fontWeight: '700' },
  weekProgress: { fontSize: 14 },
  weekBarBg: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginVertical: 12 },
  weekBarFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB20' },
  workoutRowDone: { opacity: 0.6 },
  dayBadge: { width: 36, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 11, fontWeight: '700' },
  workoutDot: { width: 8, height: 8, borderRadius: 4 },
  workoutName: { fontSize: 14, fontWeight: '600' },
  workoutInfo: { fontSize: 12 },
  strikethrough: { textDecorationLine: 'line-through' },
  cancelBtn: { alignSelf: 'center', marginTop: 24, padding: 12 },
  cancelText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
});
