import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface PINUnlockScreenProps {
  onUnlock: (pin: string) => Promise<boolean>;
  onCancel?: () => void;
}

export const PINUnlockScreen: React.FC<PINUnlockScreenProps> = ({ onUnlock, onCancel }) => {
  const [pin, setPIN] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleNumberPress = (number: string) => {
    if (isLocked || pin.length >= 6) return;
    setPIN(prev => prev + number);
  };

  const handleDelete = () => {
    if (isLocked) return;
    setPIN(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length !== 6 || isLocked) return;

    try {
      const isValid = await onUnlock(pin);
      if (isValid) {
        setPIN('');
        setAttempts(0);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPIN('');
        Vibration.vibrate(500);

        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockoutTime(30); // 30 seconds lockout
          Alert.alert('Too Many Attempts', 'Please wait 30 seconds before trying again.');
        } else {
          Alert.alert('Incorrect PIN', `${5 - newAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
      setPIN('');
    }
  };

  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin]);

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <FontAwesome name="lock" size={48} color="#a67c52" />
          <Text style={styles.title}>Enter PIN</Text>
          <Text style={styles.subtitle}>
            {isLocked 
              ? `Too many attempts. Try again in ${formatTime(lockoutTime)}`
              : 'Enter your 6-digit PIN to unlock'
            }
          </Text>
        </View>

        <View style={styles.pinContainer}>
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.pinDot,
                index < pin.length && styles.pinDotFilled,
                isLocked && styles.pinDotLocked
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
                    key === '' && styles.keypadButtonEmpty,
                    isLocked && styles.keypadButtonDisabled
                  ]}
                  onPress={() => {
                    if (key === 'delete') {
                      handleDelete();
                    } else if (key !== '') {
                      handleNumberPress(key);
                    }
                  }}
                  disabled={key === '' || isLocked}
                >
                  {key === 'delete' ? (
                    <FontAwesome 
                      name="arrow-left" 
                      size={24} 
                      color={isLocked ? '#ccc' : '#5d4037'} 
                    />
                  ) : (
                    <Text style={[
                      styles.keypadButtonText,
                      isLocked && styles.keypadButtonTextDisabled
                    ]}>
                      {key}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {attempts > 0 && !isLocked && (
          <Text style={styles.attemptsText}>
            {5 - attempts} attempts remaining
          </Text>
        )}

        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5d4037',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8d6e63',
    textAlign: 'center',
    lineHeight: 22,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
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
  pinDotLocked: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
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
  keypadButtonDisabled: {
    backgroundColor: '#f5f5f5',
    shadowOpacity: 0.05,
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5d4037',
  },
  keypadButtonTextDisabled: {
    color: '#ccc',
  },
  attemptsText: {
    fontSize: 14,
    color: '#d32f2f',
    marginTop: 16,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8d6e63',
    textAlign: 'center',
  },
});
