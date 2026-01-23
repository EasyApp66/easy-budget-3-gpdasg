
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

export default function TestOAuthScreen() {
  const { user, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  const handleTestGoogle = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    addLog('Testing Google OAuth...');
    try {
      addLog('Calling signInWithGoogle()');
      await signInWithGoogle();
      addLog('✅ Google OAuth successful!');
    } catch (error: any) {
      addLog(`❌ Google OAuth failed: ${error?.message || error}`);
      console.error('Full error:', error);
    }
  };

  const handleTestApple = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    addLog('Testing Apple OAuth...');
    try {
      addLog('Calling signInWithApple()');
      await signInWithApple();
      addLog('✅ Apple OAuth successful!');
    } catch (error: any) {
      addLog(`❌ Apple OAuth failed: ${error?.message || error}`);
      console.error('Full error:', error);
    }
  };

  const handleSignOut = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    addLog('Signing out...');
    try {
      await signOut();
      addLog('✅ Sign out successful');
    } catch (error: any) {
      addLog(`❌ Sign out failed: ${error?.message || error}`);
    }
  };

  const clearLogs = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLogs([]);
    addLog('Logs cleared');
  };

  const userEmail = user?.email || 'Not signed in';
  const userName = user?.name || 'N/A';
  const platformName = Platform.OS;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'OAuth Test',
          headerStyle: { backgroundColor: colors.black },
          headerTintColor: colors.white,
        }} 
      />
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current User</Text>
          <Text style={styles.infoText}>Email: {userEmail}</Text>
          <Text style={styles.infoText}>Name: {userName}</Text>
          <Text style={styles.infoText}>Platform: {platformName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test OAuth</Text>
          
          <Pressable 
            style={styles.button}
            onPress={handleTestGoogle}
          >
            <Text style={styles.buttonText}>Test Google Sign In</Text>
          </Pressable>

          <Pressable 
            style={styles.button}
            onPress={handleTestApple}
          >
            <Text style={styles.buttonText}>Test Apple Sign In</Text>
          </Pressable>

          {user && (
            <Pressable 
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}
            >
              <Text style={styles.buttonText}>Sign Out</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.logHeader}>
            <Text style={styles.sectionTitle}>Logs</Text>
            <Pressable onPress={clearLogs}>
              <Text style={styles.clearButton}>Clear</Text>
            </Pressable>
          </View>
          
          <ScrollView style={styles.logContainer}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neonGreen,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.neonGreen,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: colors.red,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    fontSize: 14,
    color: colors.neonGreen,
    textDecorationLine: 'underline',
  },
  logContainer: {
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 12,
    maxHeight: 300,
  },
  logText: {
    fontSize: 12,
    color: colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
});
