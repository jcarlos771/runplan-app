import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Platform } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'runplan_settings';

interface Settings {
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

const defaultSettings: Settings = {
  notificationsEnabled: false,
  reminderHour: 8,
  reminderMinute: 0,
};

export default function SettingsScreen() {
  const theme = useTheme();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [permissionStatus, setPermissionStatus] = useState<string>('');

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) setSettings(JSON.parse(data));
    } catch {}
  };

  const saveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    if (newSettings.notificationsEnabled) {
      await scheduleDailyReminder(newSettings.reminderHour, newSettings.reminderMinute);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Permisos', 'Necesitas permitir las notificaciones en los ajustes del dispositivo');
        return;
      }
    }
    await saveSettings({ ...settings, notificationsEnabled: value });
  };

  const adjustTime = async (hourDelta: number) => {
    let newHour = settings.reminderHour + hourDelta;
    if (newHour < 0) newHour = 23;
    if (newHour > 23) newHour = 0;
    await saveSettings({ ...settings, reminderHour: newHour });
  };

  const timeStr = `${settings.reminderHour.toString().padStart(2, '0')}:${settings.reminderMinute.toString().padStart(2, '0')}`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>⚙️ Ajustes</Text>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🔔 Notificaciones</Text>
        
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Recordatorio diario</Text>
            <Text style={[styles.rowDesc, { color: theme.textSecondary }]}>
              Te recordamos tu entrenamiento cada mañana
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ true: Colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {settings.notificationsEnabled && (
          <View style={styles.timeRow}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Hora del recordatorio</Text>
            <View style={styles.timePicker}>
              <TouchableOpacity style={[styles.timeBtn, { backgroundColor: theme.border }]} onPress={() => adjustTime(-1)}>
                <Ionicons name="chevron-down" size={20} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.timeValue, { color: Colors.primary }]}>{timeStr}</Text>
              <TouchableOpacity style={[styles.timeBtn, { backgroundColor: theme.border }]} onPress={() => adjustTime(1)}>
                <Ionicons name="chevron-up" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>ℹ️ Información</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Versión</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Estado notificaciones</Text>
          <Text style={[styles.infoValue, { color: permissionStatus === 'granted' ? Colors.primary : '#EF4444' }]}>
            {permissionStatus === 'granted' ? '✅ Permitidas' : '❌ No permitidas'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

async function scheduleDailyReminder(hour: number, minute: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏃 ¡Hora de entrenar!',
      body: '¡Hoy toca entrenamiento! Abre RunPlan para ver tu sesión.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: Spacing.lg },
  section: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowDesc: { fontSize: 13, marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm, marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#E5E7EB20' },
  timePicker: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  timeValue: { fontSize: 24, fontWeight: '800', marginHorizontal: Spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB20' },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
});
