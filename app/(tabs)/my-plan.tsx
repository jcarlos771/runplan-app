import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { useRef, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, workoutTypeLabels, workoutTypeIcons, Spacing, Radius, Shadow, REST_DAY_MESSAGES } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import { usePlan } from '@/data/PlanContext';
import { Workout } from '@/data/types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getRestMessage(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return REST_DAY_MESSAGES[dayOfYear % REST_DAY_MESSAGES.length];
}

export default function MyPlanScreen() {
  const theme = useTheme();
  const { activePlan, getPlanData, getCurrentWeek, toggleWorkout, isCompleted, cancelPlan } = usePlan();
  const router = useRouter();
  const plan = getPlanData();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  if (!activePlan || !plan) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.background }]}>
        <Text style={{ fontSize: 64 }}>🏃</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin plan activo</Text>
        <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
          Ve a la pestaña Planes y elige uno para empezar tu entrenamiento
        </Text>
        <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.8} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.emptyBtnText}>Ver planes disponibles</Text>
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

  const todayDow = new Date().getDay();
  const mappedDay = todayDow === 0 ? 7 : todayDow;
  const todayWorkout = weekData?.workouts.find((w) => w.day === mappedDay);

  // Check if all week workouts completed (for confetti idea)
  const weekComplete = weekTotal > 0 && weekCompleted === weekTotal;

  const handleToggle = async (day: number) => {
    await toggleWorkout(currentWeek, day);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Animated.ScrollView style={[styles.container, { backgroundColor: theme.background, opacity: fadeAnim }]} contentContainerStyle={styles.content}>
      <View style={[styles.planHeader, { backgroundColor: Colors.primary }]}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planWeek}>Semana {currentWeek} de {plan.weeks}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.round((completedCount / Math.max(totalWorkouts, 1)) * 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round((completedCount / Math.max(totalWorkouts, 1)) * 100)}% completado</Text>
      </View>

      {/* Week complete celebration */}
      {weekComplete && (
        <View style={[styles.celebrationCard, Shadow.md]}>
          <Text style={styles.celebrationEmoji}>🎉🏆🎊</Text>
          <Text style={styles.celebrationText}>¡Semana {currentWeek} completada!</Text>
          <Text style={styles.celebrationSubtext}>¡Increíble trabajo! Sigue así 💪</Text>
        </View>
      )}

      {/* Today's workout */}
      {todayWorkout && (
        <View style={[styles.todayCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.md]}>
          <View style={styles.todayTop}>
            <Text style={[styles.todayLabel, { color: Colors.primary }]}>HOY</Text>
            <Text style={{ fontSize: 28 }}>{workoutTypeIcons[todayWorkout.type]}</Text>
          </View>
          <Text style={[styles.todayTitle, { color: theme.text }]}>{todayWorkout.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: Colors.workout[todayWorkout.type] + '20' }]}>
            <Text style={{ color: Colors.workout[todayWorkout.type], fontWeight: '600', fontSize: 12 }}>
              {workoutTypeLabels[todayWorkout.type]}
            </Text>
          </View>
          {todayWorkout.type === 'rest' ? (
            <Text style={[styles.restMessage, { color: theme.textSecondary }]}>{getRestMessage()}</Text>
          ) : (
            <Text style={[styles.todayDesc, { color: theme.textSecondary }]}>{todayWorkout.description}</Text>
          )}
          {todayWorkout.type !== 'rest' && (
            <TouchableOpacity
              style={[styles.completeBtn, isCompleted(currentWeek, mappedDay) && styles.completeBtnDone]}
              activeOpacity={0.8}
              onPress={() => handleToggle(mappedDay)}
            >
              <Ionicons name={isCompleted(currentWeek, mappedDay) ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} color="#fff" />
              <Text style={styles.completeBtnText}>
                {isCompleted(currentWeek, mappedDay) ? '¡Completado!' : 'Marcar completado'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Week card */}
      <View style={[styles.weekCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
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
          const isToday = wo.day === mappedDay;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.workoutRow, done && styles.workoutRowDone, isToday && { backgroundColor: Colors.primary + '08' }]}
              activeOpacity={0.7}
              onPress={wo.type !== 'rest' ? () => handleToggle(wo.day) : undefined}
              disabled={wo.type === 'rest'}
            >
              <View style={[styles.dayBadge, { backgroundColor: isToday ? Colors.primary : theme.border }]}>
                <Text style={[styles.dayText, { color: isToday ? '#fff' : theme.textSecondary }]}>
                  {dayNames[wo.day - 1]}
                </Text>
              </View>
              <Text style={{ fontSize: 18, marginRight: 4 }}>{workoutTypeIcons[wo.type]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.workoutName, { color: theme.text }, done && styles.strikethrough]}>{wo.title}</Text>
                <Text style={[styles.workoutInfo, { color: theme.textSecondary }]}>
                  {wo.type === 'rest' ? getRestMessage() : wo.distance ? `${wo.distance} km` : wo.duration ? `${wo.duration} min` : ''}
                </Text>
              </View>
              {wo.type !== 'rest' && (
                <Ionicons
                  name={done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={done ? Colors.primary : theme.textSecondary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.cancelBtn}
        activeOpacity={0.7}
        onPress={() => Alert.alert('Cancelar plan', '¿Seguro que quieres abandonar este plan?', [
          { text: 'No', style: 'cancel' },
          { text: 'Sí, cancelar', style: 'destructive', onPress: cancelPlan },
        ])}
      >
        <Text style={styles.cancelText}>Abandonar plan</Text>
      </TouchableOpacity>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 24, fontWeight: '800', marginTop: Spacing.md },
  emptyDesc: { fontSize: 15, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  emptyBtn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: 14, borderRadius: Radius.md },
  emptyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  planHeader: { padding: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  planName: { color: '#fff', fontSize: 26, fontWeight: '800' },
  planWeek: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: Spacing.xs, marginBottom: Spacing.md },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  progressText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 6, fontWeight: '700' },
  celebrationCard: {
    margin: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  celebrationEmoji: { fontSize: 36 },
  celebrationText: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: Spacing.sm },
  celebrationSubtext: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: Spacing.xs },
  todayCard: { margin: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  todayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  todayTitle: { fontSize: 22, fontWeight: '700', marginTop: Spacing.xs },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm, marginTop: 6 },
  todayDesc: { fontSize: 14, marginTop: Spacing.sm, lineHeight: 20 },
  restMessage: { fontSize: 15, marginTop: Spacing.sm, lineHeight: 22, fontStyle: 'italic' },
  completeBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.md, marginTop: Spacing.md },
  completeBtnDone: { backgroundColor: Colors.primaryLight },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  weekCard: { marginHorizontal: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekTitle: { fontSize: 18, fontWeight: '700' },
  weekProgress: { fontSize: 14 },
  weekBarBg: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginVertical: Spacing.md },
  weekBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB20', borderRadius: Radius.sm, paddingHorizontal: 4 },
  workoutRowDone: { opacity: 0.5 },
  dayBadge: { width: 38, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 11, fontWeight: '700' },
  workoutName: { fontSize: 15, fontWeight: '600' },
  workoutInfo: { fontSize: 12, marginTop: 1 },
  strikethrough: { textDecorationLine: 'line-through' },
  cancelBtn: { alignSelf: 'center', marginTop: Spacing.lg, padding: Spacing.md },
  cancelText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
});
