
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  console.log('[Index] Checking auth state - user:', user ? 'logged in' : 'not logged in', 'loading:', loading);

  // Show nothing while loading to avoid flash
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
  }

  // Redirect immediately without showing loading spinner
  if (user) {
    console.log('[Index] User authenticated, redirecting to budget');
    return <Redirect href="/(tabs)/budget" />;
  }

  console.log('[Index] No user, redirecting to welcome screen');
  return <Redirect href="/welcome" />;
}
