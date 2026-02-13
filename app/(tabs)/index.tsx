import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { trainingPlans } from '@/data/plans';
import { Colors, WorkoutType, Spacing, Radius, Shadow } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import { TrainingPlan } from '@/data/types';

const difficultyColor = { beginner: Colors.primaryLight, intermediate: Colors.accent, advanced: '#EF4444' };
const difficultyLabel = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const difficultyIcon = { beginner: '🌱', intermediate: '🔥', advanced: '🚀' };

function PlanCard({ plan, index }: { plan: TrainingPlan; index: number }) {
  const router = useRouter();
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.md]}
        onPress={() => router.push(`/plan/${plan.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: difficultyColor[plan.difficulty] + '20' }]}>  
            <Text style={{ fontSize: 14 }}>{difficultyIcon[plan.difficulty]}</Text>
            <Text style={[styles.badgeText, { color: difficultyColor[plan.difficulty] }]}>
              {difficultyLabel[plan.difficulty]}
            </Text>
          </View>
          <Text style={[styles.weeks, { color: theme.textSecondary }]}>{plan.weeks} semanas</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{plan.name}</Text>
        <Text style={[styles.cardSubtitle, { color: Colors.primary }]}>{plan.subtitle}</Text>
        <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>{plan.description}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>{plan.weeklyVolume}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="trending-up-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>{plan.weeklyRuns}/sem</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PlanesScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: theme.text }]}>🏃 Planes de entrenamiento</Text>
      <Text style={[styles.subheading, { color: theme.textSecondary }]}>Elige tu objetivo y empieza a entrenar</Text>
      {trainingPlans.map((plan, i) => (
        <PlanCard key={plan.id} plan={plan} index={i} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  heading: { fontSize: 30, fontWeight: '800', marginBottom: Spacing.xs },
  subheading: { fontSize: 15, marginBottom: Spacing.lg },
  card: { borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm, gap: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  weeks: { fontSize: 13, fontWeight: '500' },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  cardSubtitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.md },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12 },
});
