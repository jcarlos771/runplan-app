import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PlanProvider } from '@/data/PlanContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <PlanProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="plan/[id]" 
          options={{ 
            headerShown: true, 
            headerBackTitle: 'Planes', 
            title: '',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </PlanProvider>
  );
}
