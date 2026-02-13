import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, workoutTypeLabels } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import { usePlan } from '@/data/PlanContext';
import { Workout } from '@/data/types';

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const dayHeaders = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function CalendarScreen() {
  const theme = useTheme();
  const { activePlan, getPlanData, isCompleted } = usePlan();
  const plan = getPlanData();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedWorkout, setSelectedWorkout] = useState<{ workout: Workout; week: number; done: boolean } | null>(null);

  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Map plan dates to workouts
  const dateMap = useMemo(() => {
    if (!activePlan || !plan) return new Map<string, { workout: Workout; week: number }>();
    const map = new Map<string, { workout: Workout; week: number }>();
    const start = new Date(activePlan.startDate);
    // Adjust start to Monday
    const startDay = start.getDay();
    const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
    const monday = new Date(start);
    monday.setDate(monday.getDate() + mondayOffset);

    plan.schedule.forEach((week) => {
      week.workouts.forEach((wo) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + (week.weekNumber - 1) * 7 + (wo.day - 1));
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        map.set(key, { workout: wo, week: week.weekNumber });
      });
    });
    return map;
  }, [activePlan, plan]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Monday-based

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  if (!activePlan || !plan) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.background }]}>
        <Ionicons name="calendar-outline" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin plan activo</Text>
        <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>Activa un plan para ver tu calendario</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => setMonthOffset(monthOffset - 1)}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: theme.text }]}>{monthNames[month]} {year}</Text>
        <TouchableOpacity onPress={() => setMonthOffset(monthOffset + 1)}>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {dayHeaders.map((d) => (
          <View key={d} style={styles.headerCell}>
            <Text style={[styles.headerText, { color: theme.textSecondary }]}>{d}</Text>
          </View>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <View key={`e${i}`} style={styles.cell} />;
          const key = `${year}-${month}-${day}`;
          const entry = dateMap.get(key);
          const color = entry ? Colors.workout[entry.workout.type] : undefined;
          const done = entry ? isCompleted(entry.week, entry.workout.day) : false;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

          return (
            <TouchableOpacity
              key={`d${day}`}
              style={[styles.cell, isToday && styles.todayCell]}
              onPress={entry ? () => setSelectedWorkout({ ...entry, done }) : undefined}
            >
              <Text style={[styles.dayNum, { color: isToday ? Colors.primary : theme.text }]}>{day}</Text>
              {color && (
                <View style={[styles.indicator, { backgroundColor: color }]}>
                  {done && <Ionicons name="checkmark" size={8} color="#fff" />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { borderColor: theme.border }]}>
        {(['easy', 'tempo', 'intervals', 'longRun', 'rest', 'cross'] as const).map((type) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.workout[type] }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>{workoutTypeLabels[type]}</Text>
          </View>
        ))}
      </View>

      {/* Detail modal */}
      <Modal visible={!!selectedWorkout} transparent animationType="fade" onRequestClose={() => setSelectedWorkout(null)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setSelectedWorkout(null)}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            {selectedWorkout && (
              <>
                <View style={[styles.modalBadge, { backgroundColor: Colors.workout[selectedWorkout.workout.type] + '20' }]}>
                  <Text style={{ color: Colors.workout[selectedWorkout.workout.type], fontWeight: '700' }}>
                    {workoutTypeLabels[selectedWorkout.workout.type]}
                  </Text>
                </View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedWorkout.workout.title}</Text>
                <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>{selectedWorkout.workout.description}</Text>
                {selectedWorkout.workout.distance && <Text style={[styles.modalMeta, { color: theme.text }]}>📏 {selectedWorkout.workout.distance} km</Text>}
                {selectedWorkout.workout.duration && <Text style={[styles.modalMeta, { color: theme.text }]}>⏱ {selectedWorkout.workout.duration} min</Text>}
                {selectedWorkout.done && (
                  <View style={styles.modalDone}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    <Text style={{ color: Colors.primary, fontWeight: '600' }}>Completado</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: 16 },
  emptyDesc: { fontSize: 15, textAlign: 'center', marginTop: 8 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  monthTitle: { fontSize: 20, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  headerCell: { width: '14.28%', alignItems: 'center', paddingVertical: 8 },
  headerText: { fontSize: 12, fontWeight: '700' },
  cell: { width: '14.28%', height: 56, alignItems: 'center', justifyContent: 'center' },
  todayCell: { backgroundColor: 'rgba(5,150,105,0.1)', borderRadius: 12 },
  dayNum: { fontSize: 14, fontWeight: '500' },
  indicator: { width: 14, height: 14, borderRadius: 7, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, marginTop: 8, borderTopWidth: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '80%', borderRadius: 16, padding: 24 },
  modalBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: '700' },
  modalDesc: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  modalMeta: { fontSize: 14, marginTop: 6, fontWeight: '500' },
  modalDone: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
});
