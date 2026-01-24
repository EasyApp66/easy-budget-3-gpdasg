
export type Language = 'DE' | 'EN';

export const translations = {
  DE: {
    // Welcome Screen
    welcome: {
      greeting: 'Hallo! Ich bin',
      appName: 'EASY BUDGET',
      trackBudget: 'Tracke dein',
      budget: 'BUDGET',
      trackSubs: 'Und Deine',
      subs: 'ABOS',
      continueEmail: 'Mit E-Mail fortfahren',
      continueApple: 'Mit Apple anmelden',
      continueGoogle: 'Mit Google anmelden',
      legalFooter: 'Indem du fortfährst, akzeptierst du unsere Nutzungsbedingungen (AGB), Datenschutzerklärung und rechtlichen Bedingungen',
      terms: 'Nutzungsbedingungen',
      privacy: 'Datenschutzerklärung',
      agb: 'AGBs',
    },
    // Login Screen
    login: {
      title: 'Willkommen',
      subtitle: 'Melde dich an, um fortzufahren',
      emailPlaceholder: 'deine@email.com',
      passwordPlaceholder: 'Passwort',
      loginButton: 'Anmelden',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Noch kein Konto? Registrieren',
    },
    // Register Screen
    register: {
      title: 'Konto erstellen',
      subtitle: 'Registriere dich, um zu beginnen',
      emailPlaceholder: 'deine@email.com',
      passwordPlaceholder: 'Passwort',
      confirmPasswordPlaceholder: 'Passwort bestätigen',
      registerButton: 'Registrieren',
      haveAccount: 'Bereits ein Konto? Anmelden',
      errorAllFields: 'Bitte fülle alle Felder aus',
      errorPasswordMatch: 'Passwörter stimmen nicht überein',
      errorPasswordLength: 'Passwort muss mindestens 6 Zeichen lang sein',
      errorRegistration: 'Registrierung fehlgeschlagen',
    },
    // Forgot Password Screen
    forgotPassword: {
      title: 'Passwort vergessen',
      subtitle: 'Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen',
      emailPlaceholder: 'deine@email.com',
      sendButton: 'Link senden',
      backToLogin: 'Zurück zur Anmeldung',
      loading: 'Lädt...',
      errorEmail: 'Bitte gib deine E-Mail-Adresse ein',
      successTitle: 'Link gesendet',
      successMessage: 'Wir haben dir einen Link zum Zurücksetzen deines Passworts gesendet. Bitte überprüfe deine E-Mails.',
      errorSend: 'Link konnte nicht gesendet werden',
    },
    // Budget Screen
    budget: {
      title: 'Budget',
      cash: 'BUDGET',
      total: 'TOTAL',
      remaining: 'BLEIBT',
      expenses: 'Ausgaben',
      addMonth: 'Monat hinzufügen',
      addExpense: 'Ausgabe hinzufügen',
      newExpense: 'Neue Ausgabe',
      newMonth: 'Neuer Monat',
      expenseName: 'Ausgabenname',
      amount: 'Betrag',
      cancel: 'Abbrechen',
      add: 'Hinzufügen',
      edit: 'Namen anpassen',
      editAmount: 'Zahl anpassen',
      delete: 'Löschen',
      duplicate: 'Duplizieren',
      pin: 'Fixieren',
      unpin: 'Lösen',
      save: 'Speichern',
      namePlaceholder: 'Name (z.B. ESSEN)',
      amountPlaceholder: 'Betrag (z.B. 100)',
      monthNamePlaceholder: 'Monatsname (z.B. JANUAR)',
      errorMonthName: 'Bitte gib einen Monatsnamen ein',
      errorAllFields: 'Bitte fülle alle Felder aus',
      errorInvalidAmount: 'Ungültiger Betrag',
    },
    // Abos Screen
    abos: {
      title: 'Abos',
      totalMonthly: 'ABO KOSTEN',
      totalCount: 'TOTAL',
      addSubscription: 'Abo hinzufügen',
      newSubscription: 'Neues Abo',
      subscriptionName: 'Abo-Name',
      monthlyCost: 'Monatliche Kosten',
      cancel: 'Abbrechen',
      add: 'Hinzufügen',
      edit: 'Namen anpassen',
      editAmount: 'Zahl anpassen',
      delete: 'Löschen',
      duplicate: 'Duplizieren',
      pin: 'Fixieren',
      unpin: 'Lösen',
      save: 'Speichern',
      swipeHint: '← Wischen zum Löschen · Wischen zum Fixieren →',
      errorAllFields: 'Bitte fülle alle Felder aus.',
      namePlaceholder: 'Name (z.B. SPOTIFY)',
      amountPlaceholder: 'Betrag (z.B. 10)',
    },
    // Profile Screen
    profile: {
      title: 'Profil',
      username: 'Benutzername',
      editName: 'Namen bearbeiten',
      language: 'Sprache',
      currentLanguage: 'DE',
      premium: 'Premium Holen',
      premiumStatus: 'Premium Status',
      premiumYes: 'Ja',
      premiumNo: 'Nein',
      premiumExpires: 'Läuft ab in',
      premiumDays: 'Tagen',
      promoCode: 'Promo Code',
      promoCodePlaceholder: 'Code eingeben',
      redeemCode: 'Code einlösen',
      support: 'Support',
      bugReport: 'Bug Melden',
      suggestion: 'Vorschlag',
      donation: 'Donation',
      deleteAccount: 'Konto löschen',
      deleteAccountConfirm: 'Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      accountDeleted: 'Konto gelöscht',
      accountDeletedMessage: 'Dein Konto wurde erfolgreich gelöscht.',
      terms: 'Nutzungsbedingungen',
      privacy: 'Datenschutz',
      agb: 'AGB',
      impressum: 'Impressum',
      logout: 'Ausloggen',
      logoutConfirm: 'Möchtest du dich wirklich ausloggen?',
      yes: 'Ja',
      no: 'Nein',
      codeRedeemed: 'Code eingelöst!',
      codeRedeemedMessage: 'Du hast jetzt 30 Tage Premium Zugang!',
      invalidCode: 'Ungültiger Code',
      invalidCodeMessage: 'Dieser Code ist ungültig oder wurde bereits verwendet.',
    },
    // Premium Modal
    premium: {
      title: 'Premium Holen',
      subtitle: 'Erhalte unbegrenzte App-Funktionen:',
      features: [
        'Unbegrenzte Abos',
        'Unbegrenzte Ausgabenliste',
        'Unbegrenzte Monate',
      ],
      oneTime: 'Einmalige Zahlung',
      oneTimePrice: 'CHF 10.00',
      monthly: 'Monatliches Abo',
      monthlyPrice: 'CHF 1.00/Monat',
      close: 'Schließen',
      pay: 'Bezahlen',
      or: 'ODER',
      processing: 'Verarbeitung...',
      errorTitle: 'Fehler',
      errorMessage: 'Zahlung fehlgeschlagen. Bitte versuche es erneut.',
      successTitle: 'Erfolg',
      successMessage: 'Premium erfolgreich aktiviert!',
    },
    // Common
    common: {
      ok: 'OK',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      back: 'Zurück',
      close: 'Schließen',
      confirm: 'Bestätigen',
      error: 'Fehler',
      success: 'Erfolg',
    },
    // Legal Pages - Swiss Law Compliant
    legal: {
      modalTitle: 'Rechtliches',
      termsTitle: 'Nutzungsbedingungen',
      termsContent: `NUTZUNGSBEDINGUNGEN / TERMS OF USE
EASY BUDGET 3.0

Gültig ab: Januar 2025

1. ALLGEMEINE BESTIMMUNGEN

Diese Nutzungsbedingungen regeln die Nutzung der EASY BUDGET 3.0 Mobile-App (nachfolgend "App" genannt) gemäß Schweizer Recht.

Verantwortlich:
Ivan Mirosnic (auch bekannt als Nugat / Ivan Mirosnic Nugat)
Ahornstrasse
8600 Dübendorf
Schweiz
E-Mail: ivanmirosnic006@gmail.com

2. VERTRAGSSCHLUSS

Der Nutzungsvertrag kommt durch die Installation und erste Nutzung der App zustande. Mit der Nutzung akzeptieren Sie diese Nutzungsbedingungen vollständig.

3. LEISTUNGSUMFANG

Die App bietet folgende Funktionen:
- Budget-Tracking und Verwaltung
- Abonnement-Verwaltung
- Ausgaben-Kategorisierung
- Monatliche Übersichten

4. NUTZUNGSRECHTE

Sie erhalten ein nicht-exklusives, nicht übertragbares, widerrufliches Recht zur Nutzung der App für private, nicht-kommerzielle Zwecke.

5. PFLICHTEN DES NUTZERS

Der Nutzer verpflichtet sich:
- Die App nur für rechtmäßige Zwecke zu nutzen
- Keine missbräuchliche Nutzung vorzunehmen
- Die Zugangsdaten vertraulich zu behandeln

6. PREMIUM-FUNKTIONEN

Premium-Funktionen können gegen Bezahlung freigeschaltet werden. Die Preise sind in der App ersichtlich. Zahlungen erfolgen über die jeweiligen App-Store-Zahlungsmethoden.

7. WIDERRUFSRECHT

Gemäß Schweizer Konsumentenschutzgesetz haben Sie ein 14-tägiges Widerrufsrecht. Bei digitalen Inhalten erlischt dieses Recht mit Beginn der Nutzung.

8. HAFTUNGSAUSSCHLUSS

Die App wird "wie besehen" bereitgestellt. Wir übernehmen keine Garantie für:
- Ununterbrochene Verfügbarkeit
- Fehlerfreien Betrieb
- Vollständigkeit der Daten

Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, soweit gesetzlich zulässig.

9. DATENSCHUTZ

Siehe separate Datenschutzerklärung.

10. ÄNDERUNGEN

Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Änderungen werden in der App bekannt gegeben.

11. ANWENDBARES RECHT

Es gilt ausschließlich Schweizer Recht unter Ausschluss des UN-Kaufrechts.

12. GERICHTSSTAND

Gerichtsstand ist Dübendorf, Schweiz.

Kontakt:
Ivan Mirosnic
E-Mail: ivanmirosnic006@gmail.com
Ahornstrasse, 8600 Dübendorf, Schweiz`,

      privacyTitle: 'Datenschutzerklärung',
      privacyContent: `DATENSCHUTZERKLÄRUNG / PRIVACY POLICY
EASY BUDGET 3.0

Gültig ab: Januar 2025

Verantwortlich für die Datenverarbeitung:
Ivan Mirosnic (auch bekannt als Nugat / Ivan Mirosnic Nugat)
Ahornstrasse
8600 Dübendorf
Schweiz
E-Mail: ivanmirosnic006@gmail.com

Diese Datenschutzerklärung entspricht den Anforderungen des Schweizer Datenschutzgesetzes (DSG) und der EU-DSGVO.

1. GRUNDSATZ DER DATENMINIMIERUNG

Wir nehmen den Schutz Ihrer Privatsphäre sehr ernst und erheben nur die absolut notwendigen Daten.

2. WELCHE DATEN WIR ERHEBEN

Wir erheben ausschließlich:
- Benutzer-ID (User ID) für die Authentifizierung

WIR ERHEBEN NICHT:
- Keinen Namen
- Keine E-Mail-Adresse
- Keine Telefonnummer
- Keine Standortdaten
- Keine anderen persönlichen Daten

3. VERWENDUNG DER DATEN

Die Benutzer-ID wird ausschließlich verwendet für:
- Authentifizierung und Zugriffsverwaltung
- Synchronisation Ihrer App-Daten
- Bereitstellung der App-Funktionen

4. ANONYMISIERTE VERHALTENSANALYSE

Wir können allgemeine Nutzungsmuster in anonymisierter oder aggregierter Form beobachten und analysieren, um:
- Die App-Performance zu verbessern
- Fehler zu identifizieren und zu beheben
- Neue Funktionen zu entwickeln

Diese Analysen erfolgen ausschließlich in anonymisierter Form ohne Personenbezug.

5. WEITERGABE VON DATEN

Wir geben KEINE persönlichen Daten an Dritte weiter.

Ausnahmen:
- Gesetzliche Verpflichtung
- Gerichtliche Anordnung

6. DATENSPEICHERUNG

Ihre Daten werden sicher und verschlüsselt gespeichert auf Servern in der Schweiz oder EU.

7. IHRE RECHTE

Sie haben das Recht auf:
- Auskunft über Ihre gespeicherten Daten
- Berichtigung unrichtiger Daten
- Löschung Ihrer Daten
- Datenübertragbarkeit
- Widerspruch gegen die Datenverarbeitung

8. DATENSICHERHEIT

Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten vor:
- Unbefugtem Zugriff
- Verlust
- Missbrauch
- Manipulation
zu schützen.

9. COOKIES UND TRACKING

Die App verwendet keine Cookies oder Tracking-Technologien für Werbezwecke.

10. ÄNDERUNGEN

Wir behalten uns das Recht vor, diese Datenschutzerklärung zu aktualisieren. Änderungen werden in der App bekannt gegeben.

11. KONTAKT

Bei Fragen zum Datenschutz kontaktieren Sie uns:

Ivan Mirosnic
E-Mail: ivanmirosnic006@gmail.com
Ahornstrasse, 8600 Dübendorf, Schweiz

12. BESCHWERDERECHT

Sie haben das Recht, sich bei der zuständigen Datenschutzbehörde zu beschweren:

Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)
Feldeggweg 1
3003 Bern
Schweiz
www.edoeb.admin.ch`,

      agbTitle: 'Allgemeine Geschäftsbedingungen (AGB)',
      agbContent: `ALLGEMEINE GESCHÄFTSBEDINGUNGEN (AGB)
EASY BUDGET 3.0

Gültig ab: Januar 2025

Anbieter:
Ivan Mirosnic (auch bekannt als Nugat / Ivan Mirosnic Nugat)
Ahornstrasse
8600 Dübendorf
Schweiz
E-Mail: ivanmirosnic006@gmail.com

1. GELTUNGSBEREICH

Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen dem Nutzer und EASY BUDGET bezüglich der Nutzung der App.

2. VERTRAGSSCHLUSS

Der Vertrag kommt mit der Registrierung und ersten Nutzung der App zustande. Mit der Nutzung akzeptieren Sie diese AGB vollständig.

3. LEISTUNGEN

Wir bieten eine Budget- und Abonnement-Tracking-App mit folgenden Funktionen:
- Budget-Verwaltung
- Ausgaben-Tracking
- Abonnement-Übersicht
- Monatliche Berichte
- Premium-Funktionen (optional)

4. KOSTENLOSE BASISVERSION

Die Basisversion der App ist kostenlos nutzbar mit eingeschränktem Funktionsumfang.

5. PREMIUM-FUNKTIONEN

Premium-Funktionen können erworben werden:
- Einmalige Zahlung: CHF 10.00 (lebenslanger Zugang)
- Monatliches Abo: CHF 1.00/Monat

Die Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.

6. ZAHLUNGSBEDINGUNGEN

Zahlungen erfolgen über:
- Apple App Store (iOS)
- Google Play Store (Android)

Es gelten die jeweiligen Zahlungsbedingungen der App-Stores.

7. WIDERRUFSRECHT

Gemäß Schweizer Konsumentenschutzgesetz haben Sie ein 14-tägiges Widerrufsrecht.

Bei digitalen Inhalten erlischt das Widerrufsrecht mit Beginn der Nutzung, sofern Sie ausdrücklich zugestimmt haben und zur Kenntnis genommen haben, dass Sie Ihr Widerrufsrecht verlieren.

8. GEWÄHRLEISTUNG

Es gelten die gesetzlichen Gewährleistungsrechte gemäß Schweizer Obligationenrecht (OR).

Wir gewährleisten:
- Funktionsfähigkeit der App im Rahmen der Beschreibung
- Behebung von Mängeln innerhalb angemessener Frist

9. HAFTUNG

Unsere Haftung ist beschränkt auf:
- Vorsatz und grobe Fahrlässigkeit
- Verletzung wesentlicher Vertragspflichten

Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit gesetzlich zulässig.

10. VERFÜGBARKEIT

Wir bemühen uns um eine hohe Verfügbarkeit der App, können jedoch keine 100%ige Verfügbarkeit garantieren.

Wartungsarbeiten werden nach Möglichkeit angekündigt.

11. KÜNDIGUNG

Sie können die Nutzung der App jederzeit beenden durch:
- Deinstallation der App
- Löschung Ihres Accounts

Premium-Abonnements können gemäß den Bedingungen des jeweiligen App-Stores gekündigt werden.

12. ÄNDERUNGEN DER AGB

Wir behalten uns das Recht vor, diese AGB zu ändern. Änderungen werden in der App bekannt gegeben und treten 30 Tage nach Bekanntgabe in Kraft.

13. SCHLUSSBESTIMMUNGEN

Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.

14. ANWENDBARES RECHT

Es gilt ausschließlich Schweizer Recht unter Ausschluss des UN-Kaufrechts.

15. GERICHTSSTAND

Gerichtsstand für alle Streitigkeiten ist Dübendorf, Schweiz.

16. KONTAKT

Bei Fragen zu diesen AGB kontaktieren Sie uns:

Ivan Mirosnic
E-Mail: ivanmirosnic006@gmail.com
Ahornstrasse, 8600 Dübendorf, Schweiz`,

      impressumTitle: 'Impressum',
      impressumContent: `IMPRESSUM / LEGAL NOTICE
EASY BUDGET 3.0

═══════════════════════════════════════

ANGABEN ZUM ANBIETER

App-Name: EASY BUDGET 3.0
Version: 1.0.0
Plattformen: iOS, Android

═══════════════════════════════════════

VERANTWORTLICH FÜR DEN INHALT

Name: Ivan Mirosnic
Auch bekannt als: Nugat / Ivan Mirosnic Nugat

Adresse:
Ahornstrasse
8600 Dübendorf
Schweiz

Kontakt:
E-Mail: ivanmirosnic006@gmail.com
Support: ivanmirosnic006@gmail.com

═══════════════════════════════════════

RECHTLICHE HINWEISE

Urheberrecht:
Alle Inhalte dieser App (Texte, Bilder, Grafiken, Design) sind urheberrechtlich geschützt. Jede Verwendung außerhalb der Grenzen des Urheberrechts bedarf der schriftlichen Zustimmung.

Markenrecht:
EASY BUDGET ist eine Marke von Ivan Mirosnic.

═══════════════════════════════════════

HAFTUNGSAUSSCHLUSS

Haftung für Inhalte:
Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen.

Haftung für Links:
Unsere App kann Links zu externen Websites enthalten. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich. Wir übernehmen keine Haftung für externe Inhalte.

Technische Verfügbarkeit:
Wir bemühen uns um eine hohe Verfügbarkeit der App, können jedoch keine ununterbrochene Verfügbarkeit garantieren.

═══════════════════════════════════════

DATENSCHUTZ

Für Informationen zur Datenverarbeitung siehe unsere separate Datenschutzerklärung.

Datenschutzbeauftragter:
Ivan Mirosnic
E-Mail: ivanmirosnic006@gmail.com

═══════════════════════════════════════

STREITBEILEGUNG

Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.

Bei Streitigkeiten wenden Sie sich bitte direkt an:
E-Mail: ivanmirosnic006@gmail.com

═══════════════════════════════════════

ANWENDBARES RECHT

Es gilt ausschließlich Schweizer Recht.

Gerichtsstand:
Dübendorf, Schweiz

═══════════════════════════════════════

KONTAKT UND SUPPORT

Allgemeine Anfragen:
E-Mail: ivanmirosnic006@gmail.com

Technischer Support:
E-Mail: ivanmirosnic006@gmail.com

Bug Reports:
E-Mail: ivanmirosnic006@gmail.com

Feedback und Vorschläge:
E-Mail: ivanmirosnic006@gmail.com

═══════════════════════════════════════

WEITERE INFORMATIONEN

Entwicklung: Ivan Mirosnic
Design: Ivan Mirosnic
Copyright © 2025 Ivan Mirosnic
Alle Rechte vorbehalten.

═══════════════════════════════════════

Stand: Januar 2025

Änderungen vorbehalten.`,
    },
  },
  EN: {
    // Welcome Screen
    welcome: {
      greeting: 'Hello! I am',
      appName: 'EASY BUDGET',
      trackBudget: 'Track your',
      budget: 'BUDGET',
      trackSubs: 'And your',
      subs: 'SUBSCRIPTIONS',
      continueEmail: 'Continue with Email',
      continueApple: 'Sign in with Apple',
      continueGoogle: 'Sign in with Google',
      legalFooter: 'By continuing you accept our Terms of Use (AGB), Privacy Policy and legal conditions',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      agb: 'Terms and Conditions',
    },
    // Login Screen
    login: {
      title: 'Welcome',
      subtitle: 'Sign in to continue',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: 'Password',
      loginButton: 'Sign In',
      forgotPassword: 'Forgot Password?',
      noAccount: 'No account yet? Register',
    },
    // Register Screen
    register: {
      title: 'Create Account',
      subtitle: 'Register to get started',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: 'Password',
      confirmPasswordPlaceholder: 'Confirm Password',
      registerButton: 'Register',
      haveAccount: 'Already have an account? Sign In',
      errorAllFields: 'Please fill in all fields',
      errorPasswordMatch: 'Passwords do not match',
      errorPasswordLength: 'Password must be at least 6 characters long',
      errorRegistration: 'Registration failed',
    },
    // Forgot Password Screen
    forgotPassword: {
      title: 'Forgot Password',
      subtitle: 'Enter your email address and we will send you a reset link',
      emailPlaceholder: 'your@email.com',
      sendButton: 'Send Link',
      backToLogin: 'Back to Sign In',
      loading: 'Loading...',
      errorEmail: 'Please enter your email address',
      successTitle: 'Link Sent',
      successMessage: 'We have sent you a password reset link. Please check your emails.',
      errorSend: 'Could not send link',
    },
    // Budget Screen
    budget: {
      title: 'Budget',
      cash: 'BUDGET',
      total: 'TOTAL',
      remaining: 'REMAINING',
      expenses: 'Expenses',
      addMonth: 'Add Month',
      addExpense: 'Add Expense',
      newExpense: 'New Expense',
      newMonth: 'New Month',
      expenseName: 'Expense Name',
      amount: 'Amount',
      cancel: 'Cancel',
      add: 'Add',
      edit: 'Edit Name',
      editAmount: 'Edit Amount',
      delete: 'Delete',
      duplicate: 'Duplicate',
      pin: 'Pin',
      unpin: 'Unpin',
      save: 'Save',
      namePlaceholder: 'Name (e.g. FOOD)',
      amountPlaceholder: 'Amount (e.g. 100)',
      monthNamePlaceholder: 'Month name (e.g. JANUARY)',
      errorMonthName: 'Please enter a month name',
      errorAllFields: 'Please fill in all fields',
      errorInvalidAmount: 'Invalid amount',
    },
    // Abos Screen
    abos: {
      title: 'Subscriptions',
      totalMonthly: 'SUBSCRIPTION COSTS',
      totalCount: 'TOTAL',
      addSubscription: 'Add Subscription',
      newSubscription: 'New Subscription',
      subscriptionName: 'Subscription Name',
      monthlyCost: 'Monthly Cost',
      cancel: 'Cancel',
      add: 'Add',
      edit: 'Edit Name',
      editAmount: 'Edit Amount',
      delete: 'Delete',
      duplicate: 'Duplicate',
      pin: 'Pin',
      unpin: 'Unpin',
      save: 'Save',
      swipeHint: '← Swipe to Delete · Swipe to Pin →',
      errorAllFields: 'Please fill in all fields.',
      namePlaceholder: 'Name (e.g. SPOTIFY)',
      amountPlaceholder: 'Amount (e.g. 10)',
    },
    // Profile Screen
    profile: {
      title: 'Profile',
      username: 'Username',
      editName: 'Edit Name',
      language: 'Language',
      currentLanguage: 'EN',
      premium: 'Get Premium',
      premiumStatus: 'Premium Status',
      premiumYes: 'Yes',
      premiumNo: 'No',
      premiumExpires: 'Expires in',
      premiumDays: 'days',
      promoCode: 'Promo Code',
      promoCodePlaceholder: 'Enter code',
      redeemCode: 'Redeem Code',
      support: 'Support',
      bugReport: 'Report Bug',
      suggestion: 'Suggestion',
      donation: 'Donate',
      deleteAccount: 'Delete Account',
      deleteAccountConfirm: 'Are you sure you want to delete your account? This action cannot be undone.',
      accountDeleted: 'Account Deleted',
      accountDeletedMessage: 'Your account has been successfully deleted.',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      agb: 'Terms and Conditions',
      impressum: 'Imprint',
      logout: 'Sign Out',
      logoutConfirm: 'Are you sure you want to sign out?',
      yes: 'Yes',
      no: 'No',
      codeRedeemed: 'Code Redeemed!',
      codeRedeemedMessage: 'You now have 30 days of Premium access!',
      invalidCode: 'Invalid Code',
      invalidCodeMessage: 'This code is invalid or has already been used.',
    },
    // Premium Modal
    premium: {
      title: 'Get Premium',
      subtitle: 'Get unlimited app features:',
      features: [
        'Unlimited Subscriptions',
        'Unlimited Expense List',
        'Unlimited Months',
      ],
      oneTime: 'One-Time Payment',
      oneTimePrice: 'CHF 10.00',
      monthly: 'Monthly Subscription',
      monthlyPrice: 'CHF 1.00/Month',
      close: 'Close',
      pay: 'Pay',
      or: 'OR',
      processing: 'Processing...',
      errorTitle: 'Error',
      errorMessage: 'Payment failed. Please try again.',
      successTitle: 'Success',
      successMessage: 'Premium activated successfully!',
    },
    // Common
    common: {
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      back: 'Back',
      close: 'Close',
      confirm: 'Confirm',
      error: 'Error',
      success: 'Success',
    },
    // Legal Pages - Swiss Law Compliant (English version)
    legal: {
      modalTitle: 'Legal Information',
      termsTitle: 'Terms of Use',
      termsContent: `TERMS OF USE
EASY BUDGET 3.0

Effective: January 2025

1. GENERAL PROVISIONS

These Terms of Use govern the use of the EASY BUDGET 3.0 mobile app (hereinafter "App") in accordance with Swiss law.

Responsible:
Ivan Mirosnic (also known as Nugat / Ivan Mirosnic Nugat)
Ahornstrasse
8600 Dübendorf
Switzerland
Email: ivanmirosnic006@gmail.com

2. CONTRACT FORMATION

The usage contract is formed upon installation and first use of the App. By using the App, you fully accept these Terms of Use.

3. SCOPE OF SERVICES

The App offers the following features:
- Budget tracking and management
- Subscription management
- Expense categorization
- Monthly overviews

4. USAGE RIGHTS

You receive a non-exclusive, non-transferable, revocable right to use the App for private, non-commercial purposes.

5. USER OBLIGATIONS

The user agrees to:
- Use the App only for lawful purposes
- Not engage in abusive use
- Keep access credentials confidential

6. PREMIUM FEATURES

Premium features can be unlocked for a fee. Prices are displayed in the App. Payments are processed through the respective app store payment methods.

7. RIGHT OF WITHDRAWAL

In accordance with Swiss consumer protection law, you have a 14-day right of withdrawal. For digital content, this right expires upon commencement of use.

8. DISCLAIMER

The App is provided "as is". We do not guarantee:
- Uninterrupted availability
- Error-free operation
- Completeness of data

Liability is limited to intent and gross negligence, to the extent legally permissible.

9. PRIVACY

See separate Privacy Policy.

10. CHANGES

We reserve the right to change these Terms of Use at any time. Changes will be announced in the App.

11. APPLICABLE LAW

Swiss law applies exclusively, excluding the UN Convention on Contracts for the International Sale of Goods.

12. JURISDICTION

Place of jurisdiction is Dübendorf, Switzerland.

Contact:
Ivan Mirosnic
Email: ivanmirosnic006@gmail.com
Ahornstrasse, 8600 Dübendorf, Switzerland`,

      privacyTitle: 'Privacy Policy',
      privacyContent: `PRIVACY POLICY
EASY BUDGET 3.0

Effective: January 2025

Responsible for data processing:
Ivan Mirosnic (also known as Nugat / Ivan Mirosnic Nugat)
Ahornstrasse
8600 Dübendorf
Switzerland
Email: ivanmirosnic006@gmail.com

This Privacy Policy complies with the requirements of the Swiss Data Protection Act (DSG) and the EU GDPR.

1. PRINCIPLE OF DATA MINIMIZATION

We take the protection of your privacy very seriously and only collect absolutely necessary data.

2. WHAT DATA WE COLLECT

We exclusively collect:
- User ID for authentication

WE DO NOT COLLECT:
- No name
- No email address
- No phone number
- No location data
- No other personal data

3. USE OF DATA

The User ID is used exclusively for:
- Authentication and access management
- Synchronization of your app data
- Provision of app features

4. ANONYMIZED BEHAVIORAL ANALYSIS

We may observe and analyze general usage patterns in anonymized or aggregated form to:
- Improve app performance
- Identify and fix errors
- Develop new features

These analyses are conducted exclusively in anonymized form without personal reference.

5. DATA SHARING

We do NOT share personal data with third parties.

Exceptions:
- Legal obligation
- Court order

6. DATA STORAGE

Your data is stored securely and encrypted on servers in Switzerland or the EU.

7. YOUR RIGHTS

You have the right to:
- Information about your stored data
- Correction of incorrect data
- Deletion of your data
- Data portability
- Object to data processing

8. DATA SECURITY

We implement technical and organizational measures to protect your data from:
- Unauthorized access
- Loss
- Misuse
- Manipulation

9. COOKIES AND TRACKING

The App does not use cookies or tracking technologies for advertising purposes.

10. CHANGES

We reserve the right to update this Privacy Policy. Changes will be announced in the App.

11. CONTACT

For privacy questions, contact us:

Ivan Mirosnic
Email: ivanmirosnic006@gmail.com
Ahornstrasse, 8600 Dübendorf, Switzerland

12. RIGHT TO COMPLAIN

You have the right to lodge a complaint with the competent data protection authority:

Federal Data Protection and Information Commissioner (FDPIC)
Feldeggweg 1
3003 Bern
Switzerland
www.edoeb.admin.ch`,

      agbTitle: 'Terms and Conditions (AGB)',
      agbContent: `TERMS AND CONDITIONS (AGB)
EASY BUDGET 3.0

Effective: January 2025

Provider:
Ivan Mirosnic (also known as Nugat / Ivan Mirosnic Nugat)
Ahornstrasse
8600 Dübendorf
Switzerland
Email: ivanmirosnic006@gmail.com

1. SCOPE

These Terms and Conditions (AGB) apply to all contracts between the user and EASY BUDGET regarding the use of the App.

2. CONTRACT FORMATION

The contract is formed upon registration and first use of the App. By using the App, you fully accept these Terms and Conditions.

3. SERVICES

We provide a budget and subscription tracking app with the following features:
- Budget management
- Expense tracking
- Subscription overview
- Monthly reports
- Premium features (optional)

4. FREE BASIC VERSION

The basic version of the App is free to use with limited functionality.

5. PREMIUM FEATURES

Premium features can be purchased:
- One-time payment: CHF 10.00 (lifetime access)
- Monthly subscription: CHF 1.00/month

Prices include statutory VAT.

6. PAYMENT TERMS

Payments are processed through:
- Apple App Store (iOS)
- Google Play Store (Android)

The respective payment terms of the app stores apply.

7. RIGHT OF WITHDRAWAL

In accordance with Swiss consumer protection law, you have a 14-day right of withdrawal.

For digital content, the right of withdrawal expires upon commencement of use, provided you have expressly agreed and acknowledged that you lose your right of withdrawal.

8. WARRANTY

Statutory warranty rights apply in accordance with Swiss Code of Obligations (OR).

We warrant:
- Functionality of the App as described
- Remedy of defects within a reasonable period

9. LIABILITY

Our liability is limited to:
- Intent and gross negligence
- Breach of essential contractual obligations

Liability for slight negligence is excluded to the extent legally permissible.

10. AVAILABILITY

We strive for high availability of the App but cannot guarantee 100% availability.

Maintenance work will be announced when possible.

11. TERMINATION

You can terminate use of the App at any time by:
- Uninstalling the App
- Deleting your account

Premium subscriptions can be canceled according to the terms of the respective app store.

12. CHANGES TO TERMS AND CONDITIONS

We reserve the right to change these Terms and Conditions. Changes will be announced in the App and take effect 30 days after announcement.

13. FINAL PROVISIONS

Should individual provisions of these Terms and Conditions be invalid, the validity of the remaining provisions remains unaffected.

14. APPLICABLE LAW

Swiss law applies exclusively, excluding the UN Convention on Contracts for the International Sale of Goods.

15. JURISDICTION

Place of jurisdiction for all disputes is Dübendorf, Switzerland.

16. CONTACT

For questions about these Terms and Conditions, contact us:

Ivan Mirosnic
Email: ivanmirosnic006@gmail.com
Ahornstrasse, 8600 Dübendorf, Switzerland`,

      impressumTitle: 'Imprint (Legal Notice)',
      impressumContent: `IMPRINT / LEGAL NOTICE
EASY BUDGET 3.0

═══════════════════════════════════════

PROVIDER INFORMATION

App Name: EASY BUDGET 3.0
Version: 1.0.0
Platforms: iOS, Android

═══════════════════════════════════════

RESPONSIBLE FOR CONTENT

Name: Ivan Mirosnic
Also known as: Nugat / Ivan Mirosnic Nugat

Address:
Ahornstrasse
8600 Dübendorf
Switzerland

Contact:
Email: ivanmirosnic006@gmail.com
Support: ivanmirosnic006@gmail.com

═══════════════════════════════════════

LEGAL NOTICES

Copyright:
All content of this App (texts, images, graphics, design) is protected by copyright. Any use outside the limits of copyright law requires written consent.

Trademark:
EASY BUDGET is a trademark of Ivan Mirosnic.

═══════════════════════════════════════

DISCLAIMER

Liability for Content:
Despite careful content control, we assume no liability for the accuracy, completeness, and timeliness of the information provided.

Liability for Links:
Our App may contain links to external websites. The operators of the linked pages are solely responsible for their content. We assume no liability for external content.

Technical Availability:
We strive for high availability of the App but cannot guarantee uninterrupted availability.

═══════════════════════════════════════

PRIVACY

For information on data processing, see our separate Privacy Policy.

Data Protection Officer:
Ivan Mirosnic
Email: ivanmirosnic006@gmail.com

═══════════════════════════════════════

DISPUTE RESOLUTION

We are not obligated and not willing to participate in a dispute resolution procedure before a consumer arbitration board.

For disputes, please contact us directly:
Email: ivanmirosnic006@gmail.com

═══════════════════════════════════════

APPLICABLE LAW

Swiss law applies exclusively.

Jurisdiction:
Dübendorf, Switzerland

═══════════════════════════════════════

CONTACT AND SUPPORT

General Inquiries:
Email: ivanmirosnic006@gmail.com

Technical Support:
Email: ivanmirosnic006@gmail.com

Bug Reports:
Email: ivanmirosnic006@gmail.com

Feedback and Suggestions:
Email: ivanmirosnic006@gmail.com

═══════════════════════════════════════

ADDITIONAL INFORMATION

Development: Ivan Mirosnic
Design: Ivan Mirosnic
Copyright © 2025 Ivan Mirosnic
All rights reserved.

═══════════════════════════════════════

Status: January 2025

Subject to change.`,
    },
  },
};

export const getTranslation = (language: Language) => translations[language];
