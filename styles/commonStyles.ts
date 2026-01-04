
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// EASY BUDGET 3.0 Color Palette
export const colors = {
  // Core colors from design
  neonGreen: '#BFFE84',
  black: '#000000',
  white: '#FFFFFF',
  darkGray: '#232323',
  red: '#C43C3E',
  
  // Legacy aliases for compatibility
  primary: '#BFFE84',
  secondary: '#232323',
  accent: '#BFFE84',
  background: '#000000',
  backgroundAlt: '#232323',
  text: '#FFFFFF',
  grey: '#232323',
  card: '#232323',
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.neonGreen,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.darkGray,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.black,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.black,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'left',
    color: colors.white,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'left',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.white,
  },
});
