
import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const modalStyles = StyleSheet.create({
  modalContainer: {
    width: SCREEN_WIDTH * 0.92, // 92% of screen width (nearly full width)
    maxWidth: 500,
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'left',
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
