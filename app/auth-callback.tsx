
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    console.log('[AuthCallback] Handling OAuth callback...');
    
    const handleCallback = async () => {
      try {
        // Get session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthCallback] Error getting session:', error);
          router.replace('/welcome');
          return;
        }

        if (session) {
          console.log('[AuthCallback] Session found, redirecting to budget');
          router.replace('/(tabs)/budget');
        } else {
          console.log('[AuthCallback] No session, redirecting to welcome');
          router.replace('/welcome');
        }
      } catch (error) {
        console.error('[AuthCallback] Error handling callback:', error);
        router.replace('/welcome');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.neonGreen} />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});
