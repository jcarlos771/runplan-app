import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { trainingPlans } from '@/data/plans';
import { Colors, WorkoutType } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import { TrainingPlan } from '@/data/types';

const difficultyColor = { beginner: Colors.primaryLight, intermediate: Colors.accent, advanced: '#EF4444' };
const difficultyLabel = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const difficultyIcon = { beginner: 'walk', intermediate: 'bicycle', advanced: 'rocket' } as const;

function PlanCard({ plan }: { plan: TrainingPlan }) {
  const router = useRouter();
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => router.push(`/plan/${plan.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: difficultyColor[plan.difficulty] + '20' }]}>  
          <Ionicons name={difficultyIcon[plan.difficulty]} size={14} color={difficultyColor[plan.difficulty]} />
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
        <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

export default function PlanesScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: theme.text }]}>🏃 Planes de entrenamiento</Text>
      <Text style={[styles.subheading, { color: theme.textSecondary }]}>Elige tu objetivo y empieza a entrenar</Text>
      {trainingPlans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subheading: { fontSize: 15, marginBottom: 20 },
  card: { borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  weeks: { fontSize: 13, fontWeight: '500' },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  cardSubtitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12 },
});
