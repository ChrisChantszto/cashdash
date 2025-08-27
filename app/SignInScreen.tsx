import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, NativeModules, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithGoogle, extractUserInfo } from './utils/firebase';
import type { User } from './LoginScreen';
import getApiUrl from './utils/api';

const API_URL = getApiUrl();

interface SignInScreenProps {
  onLogin: (user: User) => void;
}

export default function SignInScreen({ onLogin }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const findOrCreateUserByEmail = async (nameFromGoogle: string | null, emailFromGoogle: string | null) => {
    if (!emailFromGoogle) {
      Alert.alert('Error', 'No email provided from Google');
      return;
    }
    
    try {
      const resp = await fetch(`${API_URL}/users`);
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      const users = await resp.json();
      if (Array.isArray(users)) {
        const existing = users.find((u: User) => u.email === emailFromGoogle);
        if (existing) {
          onLogin(existing);
          return;
        }
      }
      // Not found, create
      const createResp = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: nameFromGoogle || 'Google User', 
          email: emailFromGoogle 
        }),
      });
      if (!createResp.ok) throw new Error(`HTTP error! status: ${createResp.status}`);
      const created = await createResp.json();
      if (created?._id) {
        onLogin(created);
      } else {
        throw new Error('Failed to create user');
      }
    } catch (e: any) {
      Alert.alert('Google Sign-In Error', e.message || 'Failed to sign in with Google.');
    }
  };

  const handleGooglePress = async () => {
    try {
      setGoogleLoading(true);
      const credential = await signInWithGoogle();
      const { displayName, email } = extractUserInfo(credential);
      await findOrCreateUserByEmail(displayName, email);
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      timeoutId = setTimeout(() => {
        throw new Error('Connection timeout. The server is taking too long to respond.');
      }, 5000);

      const response = await fetch(`${API_URL}/users`);

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      if (!Array.isArray(users)) {
        throw new Error('Invalid response format: expected an array of users');
      }

      const found = users.find((u: User) => u.email === email);
      if (found) {
        onLogin(found);
      } else {
        Alert.alert('Not Found', 'No user found with that email. Please sign up first.');
      }
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      if (
        error.message?.includes('Network request failed') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Unable to connect to the server')
      ) {
        Alert.alert(
          'Server Unavailable',
          `Could not connect to the server at ${API_URL}.\n\n` +
            'Please ensure that:\n1. The server is running\n2. The server address is correct\n3. Your device is connected to the network'
        );
      } else if (error.message?.includes('timeout')) {
        Alert.alert('Connection Timeout', 'The server is taking too long to respond. Please try again later.');
      } else {
        Alert.alert('Error', `Failed to sign in: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Sign In</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#a1887f"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleSignIn} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>

          {/* Or divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: 300, marginVertical: 10 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e6d3b3' }} />
            <Text style={{ marginHorizontal: 8, color: '#a1887f' }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e6d3b3' }} />
          </View>

          {/* Google Sign-In */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              width: 300,
              borderWidth: 1,
              borderColor: '#d7ccc8',
              shadowColor: '#cab08a',
              shadowOpacity: 0.08,
              shadowRadius: 8,
              opacity: googleLoading ? 0.7 : 1,
            }}
            onPress={handleGooglePress}
            disabled={googleLoading}
          >
            <FontAwesome name="google" size={18} color="#db4437" style={{ marginRight: 8 }} />
            <Text style={{ color: '#5d4037', fontWeight: '600', fontSize: 16 }}>
              {googleLoading ? 'Connecting…' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.serverInfo}>Server: {API_URL}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f4e9',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#a67c52',
    marginBottom: 24,
  },
  inputGroup: {
    width: 300,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff9f4',
    borderColor: '#d7ccc8',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    color: '#5d4037',
  },
  button: {
    backgroundColor: '#ded0bc',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    width: 300,
    shadowColor: '#cab08a',
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#866e4b',
    fontWeight: '600',
    fontSize: 18,
  },
  serverInfo: {
    marginTop: 12,
    color: '#a1887f',
    fontSize: 12,
  },
});
