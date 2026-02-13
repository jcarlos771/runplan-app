import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/Colors';
import { useTheme, useColorScheme } from '@/hooks/useColorScheme';
import { Platform } from 'react-native';

export default function TabLayout() {
  const theme = useTheme();
  const scheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          paddingTop: 4,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        headerStyle: { backgroundColor: scheme === 'dark' ? Colors.dark.card : Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Planes',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-plan"
        options={{
          title: 'Mi Plan',
          tabBarIcon: ({ color, size }) => <Ionicons name="fitness" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
