import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { trainingPlans } from '@/data/plans';
import { Colors, workoutTypeLabels } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import { usePlan } from '@/data/PlanContext';
import { Workout } from '@/data/types';
import * as Haptics from 'expo-haptics';

function WorkoutRow({ workout, theme }: { workout: Workout; theme: any }) {
  const color = Colors.workout[workout.type];
  return (
    <View style={[styles.workoutRow, { borderLeftColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.workoutTitle, { color: theme.text }]}>{workout.title}</Text>
        <Text style={[styles.workoutDesc, { color: theme.textSecondary }]}>{workout.description}</Text>
      </View>
      <Text style={[styles.workoutMeta, { color: theme.textSecondary }]}>
        {workout.distance ? `${workout.distance} km` : workout.duration ? `${workout.duration} min` : ''}
      </Text>
    </View>
  );
}

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = trainingPlans.find((p) => p.id === id);
  const theme = useTheme();
  const { activePlan, startPlan } = usePlan();
  const router = useRouter();

  if (!plan) return <View style={styles.center}><Text>Plan no encontrado</Text></View>;

  const isActive = activePlan?.planId === id;

  const handleStart = () => {
    if (activePlan && activePlan.planId !== id) {
      Alert.alert(
        'Cambiar plan',
        'Ya tienes un plan activo. ¿Quieres reemplazarlo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sí, cambiar', onPress: () => { startPlan(id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } },
        ]
      );
    } else {
      startPlan(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{plan.name}</Text>
        <Text style={[styles.subtitle, { color: Colors.primary }]}>{plan.subtitle}</Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>{plan.description}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={[styles.metaText, { color: theme.text }]}>{plan.weeks} semanas</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={Colors.primary} />
            <Text style={[styles.metaText, { color: theme.text }]}>{plan.weeklyVolume}/sem</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.startBtn, isActive && styles.startBtnActive]}
          onPress={isActive ? undefined : handleStart}
          disabled={isActive}
        >
          <Ionicons name={isActive ? 'checkmark-circle' : 'play'} size={20} color="#fff" />
          <Text style={styles.startBtnText}>{isActive ? 'Plan activo' : 'Empezar plan'}</Text>
        </TouchableOpacity>
      </View>

      {plan.schedule.map((week) => (
        <View key={week.weekNumber} style={[styles.weekCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.weekTitle, { color: theme.text }]}>{week.label}</Text>
          {week.workouts.map((w, i) => (
            <WorkoutRow key={i} workout={w} theme={theme} />
          ))}
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  desc: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  meta: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, fontWeight: '500' },
  startBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  startBtnActive: { backgroundColor: Colors.primaryLight, opacity: 0.7 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  weekCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 14, borderWidth: 1 },
  weekTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  workoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderLeftWidth: 3, paddingLeft: 10, marginBottom: 4, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  workoutTitle: { fontSize: 14, fontWeight: '600' },
  workoutDesc: { fontSize: 12 },
  workoutMeta: { fontSize: 12, fontWeight: '500' },
});
