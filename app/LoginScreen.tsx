import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const API_URL = 'http://192.168.68.58:5001/api';

export type User = {
  _id: string;
  name: string;
  email: string;
};

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [signInEmail, setSignInEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { width, height } = Dimensions.get('window');
  const isSmallDevice = width < 375;

  const handleSignUp = () => {
    setLoading(true);
    fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data._id) {
          onLogin(data);
          Alert.alert('Sign up successful!');
        } else {
          Alert.alert('Sign up failed', data.error || 'Unknown error');
        }
      })
      .catch(() => setLoading(false));
  };

  const handleSignIn = () => {
    setLoading(true);
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then((users: User[]) => {
        setLoading(false);
        const found = users.find(u => u.email === signInEmail);
        if (found) {
          onLogin(found);
          Alert.alert('Sign in successful!');
        } else {
          Alert.alert('No user found with that email');
        }
      })
      .catch(() => setLoading(false));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={[styles.container, { minHeight: height }]}>  
          <View style={styles.logoContainer}>
            <View style={styles.logoTextContainer}>
              <Text
                style={[
                  styles.logoText,
                  isSmallDevice && { fontSize: 28, lineHeight: 36 },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                allowFontScaling
              >
                CashDash
              </Text>
            </View>
            <ThemedText style={[
              styles.tagline,
              isSmallDevice && { fontSize: 14 }
            ]}>
              Manage your finances with ease
            </ThemedText>
          </View>
          <View style={[
            styles.formContainer,
            {
              padding: isSmallDevice ? 15 : 25,
              paddingTop: isSmallDevice ? 20 : 30,
              minHeight: height * 0.6,
            },
          ]}>
            <View style={styles.section}>
              <ThemedText style={[
                styles.sectionTitle,
                isSmallDevice && { fontSize: 18, marginBottom: 15 }
              ]}>
                Create Account
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#a67c52"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#a67c52"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.5 }]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.section}>
              <ThemedText style={[
                styles.sectionTitle,
                isSmallDevice && { fontSize: 18, marginBottom: 15 }
              ]}>
                Sign In
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#a67c52"
                value={signInEmail}
                onChangeText={setSignInEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={[styles.button, styles.signInButton, loading && { opacity: 0.5 }]}
                onPress={handleSignIn}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  logoTextContainer: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    maxHeight: 60,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5d4037',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 36,
  },
  tagline: {
    fontSize: 16,
    color: '#8d6e63',
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5d4037',
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d7ccc8',
    padding: 12,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#fff9f4',
    color: '#5d4037',
    fontSize: 16,
    width: '100%',
    minHeight: 48,
  },
  button: {
    backgroundColor: '#a1887f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    minHeight: 48,
    justifyContent: 'center',
  },
  signInButton: {
    backgroundColor: '#8d6e63',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d7ccc8',
  },
  dividerText: {
    width: 40,
    textAlign: 'center',
    color: '#8d6e63',
  },
});
