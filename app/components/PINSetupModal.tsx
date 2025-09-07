import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Vibration } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface PINSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onPINSet: (pin: string) => Promise<void>;
}

export const PINSetupModal: React.FC<PINSetupModalProps> = ({ visible, onClose, onPINSet }) => {
  const [pin, setPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [step, setStep] = useState<'setup' | 'confirm'>('setup');
  const [loading, setLoading] = useState(false);

  const handleNumberPress = (number: string) => {
    if (step === 'setup') {
      if (pin.length < 6) {
        setPIN(prev => prev + number);
      }
    } else {
      if (confirmPIN.length < 6) {
        setConfirmPIN(prev => prev + number);
      }
    }
  };

  const handleDelete = () => {
    if (step === 'setup') {
      setPIN(prev => prev.slice(0, -1));
    } else {
      setConfirmPIN(prev => prev.slice(0, -1));
    }
  };

  const handleContinue = () => {
    if (step === 'setup' && pin.length === 6) {
      setStep('confirm');
    } else if (step === 'confirm' && confirmPIN.length === 6) {
      handleConfirmPIN();
    }
  };

  const handleConfirmPIN = async () => {
    if (pin !== confirmPIN) {
      Vibration.vibrate(500);
      Alert.alert('PIN Mismatch', 'The PINs do not match. Please try again.');
      setConfirmPIN('');
      return;
    }

    setLoading(true);
    try {
      await onPINSet(pin);
      resetModal();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to set PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setPIN('');
    setConfirmPIN('');
    setStep('setup');
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const currentPIN = step === 'setup' ? pin : confirmPIN;
  const isComplete = currentPIN.length === 6;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <FontAwesome name="times" size={24} color="#8d6e63" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {step === 'setup' ? 'Set PIN Code' : 'Confirm PIN Code'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <Text style={styles.subtitle}>
            {step === 'setup' 
              ? 'Enter a 6-digit PIN to secure your app'
              : 'Re-enter your PIN to confirm'
            }
          </Text>

          <View style={styles.pinContainer}>
            {[...Array(6)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  index < currentPIN.length && styles.pinDotFilled
                ]}
              />
            ))}
          </View>

          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['', '0', 'delete']
            ].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((key, keyIndex) => (
                  <TouchableOpacity
                    key={keyIndex}
                    style={[
                      styles.keypadButton,
                      key === '' && styles.keypadButtonEmpty
                    ]}
                    onPress={() => {
                      if (key === 'delete') {
                        handleDelete();
                      } else if (key !== '') {
                        handleNumberPress(key);
                      }
                    }}
                    disabled={key === '' || loading}
                  >
                    {key === 'delete' ? (
                      <FontAwesome name="arrow-left" size={24} color="#5d4037" />
                    ) : (
                      <Text style={styles.keypadButtonText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {isComplete && (
            <TouchableOpacity
              style={[styles.continueButton, loading && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={loading}
            >
              <Text style={styles.continueButtonText}>
                {loading ? 'Setting up...' : step === 'setup' ? 'Continue' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#f8f4e9',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5d4037',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#8d6e63',
    textAlign: 'center',
    marginBottom: 32,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d7ccc8',
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: '#a67c52',
    borderColor: '#a67c52',
  },
  keypad: {
    alignItems: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keypadButtonEmpty: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5d4037',
  },
  continueButton: {
    backgroundColor: '#a67c52',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
