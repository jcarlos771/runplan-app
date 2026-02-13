import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export function useColorScheme() {
  const scheme = useRNColorScheme() ?? 'light';
  return scheme;
}

export function useTheme() {
  const scheme = useColorScheme();
  return Colors[scheme];
}
