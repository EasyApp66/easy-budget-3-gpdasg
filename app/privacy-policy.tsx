
import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Datenschutzerklärung',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Zurück',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Datenschutzerklärung</Text>
          <Text style={styles.lastUpdated}>Zuletzt aktualisiert: Januar 2025</Text>

          <Text style={styles.sectionTitle}>1. Datenerfassung</Text>
          <Text style={styles.paragraph}>
            Easy Budget erfasst und speichert Ihre Budget- und Abonnementdaten lokal auf Ihrem Gerät.
            Wenn Sie sich für ein Konto anmelden, werden Ihre E-Mail-Adresse und Authentifizierungsdaten
            sicher auf unseren Servern gespeichert.
          </Text>

          <Text style={styles.sectionTitle}>2. Verwendung der Daten</Text>
          <Text style={styles.paragraph}>
            Ihre Daten werden ausschließlich zur Bereitstellung der App-Funktionen verwendet:
          </Text>
          <Text style={styles.bulletPoint}>• Speicherung Ihrer Budget- und Abonnementinformationen</Text>
          <Text style={styles.bulletPoint}>• Synchronisierung zwischen Ihren Geräten</Text>
          <Text style={styles.bulletPoint}>• Verwaltung Ihres Premium-Abonnements</Text>
          <Text style={styles.bulletPoint}>• Bereitstellung von Kundensupport</Text>

          <Text style={styles.sectionTitle}>3. Datensicherheit</Text>
          <Text style={styles.paragraph}>
            Wir verwenden branchenübliche Sicherheitsmaßnahmen zum Schutz Ihrer Daten:
          </Text>
          <Text style={styles.bulletPoint}>• Verschlüsselte Datenübertragung (HTTPS/TLS)</Text>
          <Text style={styles.bulletPoint}>• Sichere Authentifizierung mit Supabase</Text>
          <Text style={styles.bulletPoint}>• Regelmäßige Sicherheitsupdates</Text>

          <Text style={styles.sectionTitle}>4. Weitergabe von Daten</Text>
          <Text style={styles.paragraph}>
            Wir verkaufen oder vermieten Ihre persönlichen Daten nicht an Dritte. Daten werden nur
            in folgenden Fällen weitergegeben:
          </Text>
          <Text style={styles.bulletPoint}>• Mit Ihrer ausdrücklichen Zustimmung</Text>
          <Text style={styles.bulletPoint}>• Zur Einhaltung gesetzlicher Verpflichtungen</Text>
          <Text style={styles.bulletPoint}>• An Zahlungsdienstleister (Apple Pay) für Premium-Käufe</Text>

          <Text style={styles.sectionTitle}>5. Ihre Rechte</Text>
          <Text style={styles.paragraph}>
            Sie haben das Recht:
          </Text>
          <Text style={styles.bulletPoint}>• Auf Auskunft über Ihre gespeicherten Daten</Text>
          <Text style={styles.bulletPoint}>• Auf Berichtigung unrichtiger Daten</Text>
          <Text style={styles.bulletPoint}>• Auf Löschung Ihrer Daten</Text>
          <Text style={styles.bulletPoint}>• Auf Datenübertragbarkeit</Text>

          <Text style={styles.sectionTitle}>6. Cookies und Tracking</Text>
          <Text style={styles.paragraph}>
            Easy Budget verwendet keine Tracking-Cookies oder Analyse-Tools von Drittanbietern.
            Wir erfassen nur die für die App-Funktionalität notwendigen Daten.
          </Text>

          <Text style={styles.sectionTitle}>7. Kontakt</Text>
          <Text style={styles.paragraph}>
            Bei Fragen zum Datenschutz kontaktieren Sie uns bitte unter:
          </Text>
          <Text style={styles.contactText}>support@easybudget.app</Text>

          <Text style={styles.sectionTitle}>8. Änderungen</Text>
          <Text style={styles.paragraph}>
            Wir behalten uns das Recht vor, diese Datenschutzerklärung zu aktualisieren.
            Änderungen werden in der App bekannt gegeben.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 8,
    marginBottom: 12,
  },
});
