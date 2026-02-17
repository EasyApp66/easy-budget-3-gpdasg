
# Easy Budget 3.0

Minimalistischer Dark-Mode Budget- und Abo-Tracker mit Premium-Feeling für iOS und Android.

## 🚀 Features

### Kostenlose Version
- ✅ Budget-Tracking mit Monatsübersicht
- ✅ Abonnement-Verwaltung
- ✅ Offline-Funktionalität
- ✅ Dark Mode Design
- ✅ Haptisches Feedback
- ✅ Multi-Language Support (DE/EN)

### Premium Features
- 🌟 Unbegrenzte Budgets und Abos
- 🌟 Erweiterte Statistiken
- 🌟 Cloud-Synchronisierung
- 🌟 Export-Funktionen
- 🌟 Prioritäts-Support

## 📱 Installation

### Voraussetzungen
- Node.js 18+
- Expo CLI
- iOS Simulator oder Android Emulator (für Entwicklung)
- Apple Developer Account (für iOS-Builds)

### Entwicklung starten

```bash
# Dependencies installieren
npm install

# Expo Dev Server starten
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## 🏗️ Build für Production

### iOS (TestFlight & App Store)

1. **EAS CLI installieren**
```bash
npm install -g eas-cli
```

2. **Bei Expo anmelden**
```bash
eas login
```

3. **Projekt konfigurieren**
```bash
eas build:configure
```

4. **iOS Build erstellen**
```bash
# Preview Build (für TestFlight)
eas build --platform ios --profile preview

# Production Build (für App Store)
eas build --platform ios --profile production
```

5. **Zu TestFlight hochladen**
```bash
eas submit --platform ios --profile production
```

### Android (Google Play)

```bash
# Production Build
eas build --platform android --profile production

# Zu Google Play hochladen
eas submit --platform android --profile production
```

## 🔧 Konfiguration

### App-Konfiguration (`app.json`)
- Bundle Identifier: `com.easybudget.app`
- Version: `1.0.0`
- Build Number: Auto-increment aktiviert

### Umgebungsvariablen
Erstellen Sie eine `.env` Datei:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing

### Backend testen
```bash
cd backend
npm test
```

### Frontend testen
```bash
npm run lint
```

## 📦 Deployment Checklist

### Vor dem Launch
- [ ] App-Icons für alle Größen erstellt
- [ ] Splash Screen konfiguriert
- [ ] Privacy Policy hinzugefügt
- [ ] Terms of Service hinzugefügt
- [ ] App Store Screenshots erstellt
- [ ] App Store Beschreibung vorbereitet
- [ ] TestFlight Beta-Testing durchgeführt
- [ ] Alle Funktionen getestet (iOS & Android)
- [ ] Performance-Tests durchgeführt
- [ ] Crash-Reporting konfiguriert

### App Store Connect
- [ ] App-Informationen ausgefüllt
- [ ] Screenshots hochgeladen (alle Geräte)
- [ ] App-Vorschau-Video (optional)
- [ ] Altersfreigabe festgelegt
- [ ] Kategorien ausgewählt
- [ ] Keywords optimiert
- [ ] Support-URL hinzugefügt
- [ ] Marketing-URL hinzugefügt

### Google Play Console
- [ ] App-Informationen ausgefüllt
- [ ] Screenshots hochgeladen
- [ ] Feature-Grafik erstellt
- [ ] Kurz- und Langbeschreibung
- [ ] Datenschutzrichtlinie-URL
- [ ] Inhaltsbewertung abgeschlossen

## 🔐 Sicherheit

- Alle sensiblen Daten werden verschlüsselt gespeichert
- Authentifizierung über Supabase
- HTTPS für alle API-Anfragen
- Keine Tracking-Tools von Drittanbietern

## 📄 Lizenz

Proprietär - Alle Rechte vorbehalten

## 🆘 Support

Bei Fragen oder Problemen:
- Email: support@easybudget.app
- GitHub Issues: [github.com/yourusername/easy-budget/issues](https://github.com/yourusername/easy-budget/issues)

## 🎯 Roadmap

### Version 1.1
- [ ] Widget-Support
- [ ] Siri Shortcuts
- [ ] Apple Watch App
- [ ] Erweiterte Statistiken

### Version 1.2
- [ ] Kategorien-System
- [ ] Budgetvorlagen
- [ ] Gemeinsame Budgets
- [ ] Export zu Excel/PDF

## 👥 Team

Entwickelt mit ❤️ von [Ihr Name/Team]

---

**Hinweis:** Diese App verwendet Expo SDK 54 und React Native 0.81.4
