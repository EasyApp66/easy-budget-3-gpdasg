
import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';

export default function TermsOfServiceScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nutzungsbedingungen',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Zurück',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Nutzungsbedingungen</Text>
          <Text style={styles.lastUpdated}>Zuletzt aktualisiert: Januar 2025</Text>

          <Text style={styles.sectionTitle}>1. Akzeptanz der Bedingungen</Text>
          <Text style={styles.paragraph}>
            Durch die Nutzung von Easy Budget stimmen Sie diesen Nutzungsbedingungen zu.
            Wenn Sie nicht einverstanden sind, nutzen Sie die App bitte nicht.
          </Text>

          <Text style={styles.sectionTitle}>2. Beschreibung des Dienstes</Text>
          <Text style={styles.paragraph}>
            Easy Budget ist eine Budget- und Abonnement-Tracking-App, die Ihnen hilft,
            Ihre Finanzen zu verwalten. Die App bietet sowohl kostenlose als auch Premium-Funktionen.
          </Text>

          <Text style={styles.sectionTitle}>3. Benutzerkonto</Text>
          <Text style={styles.paragraph}>
            Sie sind verantwortlich für:
          </Text>
          <Text style={styles.bulletPoint}>• Die Sicherheit Ihres Kontos und Passworts</Text>
          <Text style={styles.bulletPoint}>• Alle Aktivitäten unter Ihrem Konto</Text>
          <Text style={styles.bulletPoint}>• Die Richtigkeit der von Ihnen bereitgestellten Informationen</Text>

          <Text style={styles.sectionTitle}>4. Premium-Abonnement</Text>
          <Text style={styles.paragraph}>
            Premium-Funktionen sind über In-App-Käufe verfügbar:
          </Text>
          <Text style={styles.bulletPoint}>• Neue Benutzer erhalten eine 2-wöchige kostenlose Testphase</Text>
          <Text style={styles.bulletPoint}>• Nach der Testphase wird das Abonnement automatisch verlängert</Text>
          <Text style={styles.bulletPoint}>• Sie können jederzeit in den iOS-Einstellungen kündigen</Text>
          <Text style={styles.bulletPoint}>• Rückerstattungen erfolgen gemäß Apple-Richtlinien</Text>

          <Text style={styles.sectionTitle}>5. Promo-Codes</Text>
          <Text style={styles.paragraph}>
            Promo-Codes können einmalig pro Benutzer eingelöst werden. Sie sind nicht übertragbar
            und können nicht gegen Bargeld eingetauscht werden.
          </Text>

          <Text style={styles.sectionTitle}>6. Verbotene Nutzung</Text>
          <Text style={styles.paragraph}>
            Sie dürfen die App nicht verwenden für:
          </Text>
          <Text style={styles.bulletPoint}>• Illegale Aktivitäten</Text>
          <Text style={styles.bulletPoint}>• Reverse Engineering oder Dekompilierung</Text>
          <Text style={styles.bulletPoint}>• Automatisierte Zugriffe oder Scraping</Text>
          <Text style={styles.bulletPoint}>• Verbreitung von Malware oder schädlichem Code</Text>

          <Text style={styles.sectionTitle}>7. Geistiges Eigentum</Text>
          <Text style={styles.paragraph}>
            Alle Rechte an Easy Budget, einschließlich Design, Code und Inhalte, sind geschützt.
            Sie erhalten eine begrenzte Lizenz zur persönlichen Nutzung.
          </Text>

          <Text style={styles.sectionTitle}>8. Haftungsausschluss</Text>
          <Text style={styles.paragraph}>
            Easy Budget wird "wie besehen" bereitgestellt. Wir übernehmen keine Garantie für:
          </Text>
          <Text style={styles.bulletPoint}>• Ununterbrochene oder fehlerfreie Verfügbarkeit</Text>
          <Text style={styles.bulletPoint}>• Richtigkeit der Berechnungen</Text>
          <Text style={styles.bulletPoint}>• Eignung für bestimmte Zwecke</Text>

          <Text style={styles.sectionTitle}>9. Haftungsbeschränkung</Text>
          <Text style={styles.paragraph}>
            Wir haften nicht für indirekte, zufällige oder Folgeschäden, die aus der Nutzung
            oder Nichtnutzung der App entstehen.
          </Text>

          <Text style={styles.sectionTitle}>10. Änderungen</Text>
          <Text style={styles.paragraph}>
            Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern.
            Wesentliche Änderungen werden in der App bekannt gegeben.
          </Text>

          <Text style={styles.sectionTitle}>11. Kündigung</Text>
          <Text style={styles.paragraph}>
            Wir können Ihr Konto bei Verstoß gegen diese Bedingungen ohne Vorankündigung sperren.
            Sie können Ihr Konto jederzeit in den App-Einstellungen löschen.
          </Text>

          <Text style={styles.sectionTitle}>12. Kontakt</Text>
          <Text style={styles.paragraph}>
            Bei Fragen zu diesen Bedingungen kontaktieren Sie uns unter:
          </Text>
          <Text style={styles.contactText}>support@easybudget.app</Text>

          <Text style={styles.sectionTitle}>13. Anwendbares Recht</Text>
          <Text style={styles.paragraph}>
            Diese Bedingungen unterliegen dem Recht der Schweiz. Gerichtsstand ist Zürich.
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
