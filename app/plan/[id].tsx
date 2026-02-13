import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { trainingPlans } from '@/data/plans';
import { Colors, workoutTypeLabels, workoutTypeIcons, Spacing, Radius, Shadow } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import { usePlan } from '@/data/PlanContext';
import { Workout } from '@/data/types';
import * as Haptics from 'expo-haptics';

function WorkoutRow({ workout, theme, index }: { workout: Workout; theme: any; index: number }) {
  const color = Colors.workout[workout.type];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 40, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.workoutRow, { borderLeftColor: color, opacity: fadeAnim }]}>
      <Text style={{ fontSize: 20 }}>{workoutTypeIcons[workout.type]}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.workoutTitle, { color: theme.text }]}>{workout.title}</Text>
        <Text style={[styles.workoutDesc, { color: theme.textSecondary }]}>{workout.description}</Text>
      </View>
      <Text style={[styles.workoutMeta, { color: theme.textSecondary }]}>
        {workout.distance ? `${workout.distance} km` : workout.duration ? `${workout.duration} min` : ''}
      </Text>
    </Animated.View>
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
          <View style={[styles.metaItem, { backgroundColor: Colors.primary + '10' }, Shadow.sm]}>
            <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            <Text style={[styles.metaText, { color: theme.text }]}>{plan.weeks} semanas</Text>
          </View>
          <View style={[styles.metaItem, { backgroundColor: Colors.primary + '10' }, Shadow.sm]}>
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <Text style={[styles.metaText, { color: theme.text }]}>{plan.weeklyVolume}/sem</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.startBtn, isActive && styles.startBtnActive]}
          activeOpacity={0.8}
          onPress={isActive ? undefined : handleStart}
          disabled={isActive}
        >
          <Ionicons name={isActive ? 'checkmark-circle' : 'play'} size={22} color="#fff" />
          <Text style={styles.startBtnText}>{isActive ? 'Plan activo' : 'Empezar plan'}</Text>
        </TouchableOpacity>
      </View>

      {plan.schedule.map((week) => (
        <View key={week.weekNumber} style={[styles.weekCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
          <Text style={[styles.weekTitle, { color: theme.text }]}>{week.label}</Text>
          {week.workouts.map((w, i) => (
            <WorkoutRow key={i} workout={w} theme={theme} index={i} />
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
  header: { padding: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.sm },
  desc: { fontSize: 14, lineHeight: 21, marginBottom: Spacing.md },
  meta: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm },
  metaText: { fontSize: 14, fontWeight: '600' },
  startBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: Radius.md },
  startBtnActive: { backgroundColor: Colors.primaryLight, opacity: 0.7 },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  weekCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  weekTitle: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.sm },
  workoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderLeftWidth: 3, paddingLeft: 10, marginBottom: Spacing.xs, gap: 10 },
  workoutTitle: { fontSize: 14, fontWeight: '600' },
  workoutDesc: { fontSize: 12, marginTop: 1 },
  workoutMeta: { fontSize: 12, fontWeight: '500' },
});
