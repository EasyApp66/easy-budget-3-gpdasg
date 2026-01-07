
import { StyleSheet, Text, View, Pressable, TextInput, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FormSheetModal() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  // Use a visible dark gray for dark mode instead of pure black
  const backgroundColor = theme.dark
    ? 'rgb(28, 28, 30)' // Dark gray that's visible against black backgrounds
    : theme.colors.background;

  // Modal width: 92% on mobile for better side margins, keep original on web
  const modalWidth = Platform.OS === 'web' ? '100%' : SCREEN_WIDTH * 0.92;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.modalContent, { width: modalWidth }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Neue Ausgabe</Text>
        
        <TextInput
          style={[styles.input, { 
            color: theme.colors.text,
            backgroundColor: '#000',
            borderColor: theme.dark ? '#333' : '#ddd'
          }]}
          placeholder="Name (z.B. ESSEN)"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[styles.input, { 
            color: theme.colors.text,
            backgroundColor: '#000',
            borderColor: theme.dark ? '#333' : '#ddd'
          }]}
          placeholder="Betrag"
          placeholderTextColor="#666"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <View style={styles.buttonRow}>
          <Pressable 
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Abbrechen</Text>
          </Pressable>

          <Pressable 
            onPress={() => {
              // Handle save logic here
              router.back();
            }}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Hinzufügen</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#232323',
    borderRadius: 20,
    // Increased padding on mobile for more breathing room
    padding: Platform.OS === 'web' ? 24 : 32,
    paddingBottom: Platform.OS === 'web' ? 24 : 28,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'left',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 18,
    fontSize: 16,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    // Reduced font size on mobile for better fit
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '700',
  },
  addButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#BFFE84',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  addButtonText: {
    color: '#000',
    // Reduced font size on mobile for better fit
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '700',
  },
});
