import React, { useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, KeyboardAvoidingView, NativeModules, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithGoogle, extractUserInfo } from './utils/firebase';

// Derive API URL based on environment and platform to avoid hardcoded LAN IPs
const getApiUrl = () => {
  const envUrl = process.env?.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    // Ensure '/api' suffix and no trailing slash
    let url = envUrl.replace(/\/$/, '');
    if (!/\/api$/.test(url)) {
      url += '/api';
    }
    return url;
  }
  // Try to infer LAN IP from the JS bundle URL (works in Expo Go on device)
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (scriptURL) {
      const { hostname } = new URL(scriptURL);
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:5001/api`;
      }
    }
  } catch (e) {
    // ignore and fall back
  }
  const base = Platform.select({
    ios: 'http://localhost:5001',
    android: 'http://10.0.2.2:5001',
    default: 'http://localhost:5001',
  });
  return `${base}/api`;
};
const API_URL = getApiUrl();

export type User = {
  _id: string;
  name: string;
  email: string;
};

interface LoginScreenProps {
  onLogin: (user: User) => void;
  navigation?: any;
}

export default function LoginScreen({ onLogin, navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [signInEmail, setSignInEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { width, height } = Dimensions.get('window');
  const isSmallDevice = width < 375;
  const [activeIndex, setActiveIndex] = useState(0);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const handleSignUp = async () => {
    // Basic validation
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data._id) {
        onLogin(data);
        // Removed the success alert for a smoother UX
      } else {
        throw new Error(data.error || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert(
        'Sign up failed',
        error.message || 'An error occurred while creating your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    console.log('Attempting to sign in with email:', signInEmail);
    
    // Basic validation
    if (!signInEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    setLoading(true);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    try {
      // Add a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        throw new Error('Connection timeout. The server is taking too long to respond.');
      }, 5000); // 5 second timeout (reduced from 10s for better UX)

      const response = await fetch(`${API_URL}/users`);
      
      // Clear the timeout as we got a response
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const users = await response.json();
      console.log('Received users:', users);
      
      if (!Array.isArray(users)) {
        throw new Error('Invalid response format: expected an array of users');
      }
      
      const found = users.find((u: User) => u.email === signInEmail);
      if (found) {
        console.log('User found, logging in:', found);
        onLogin(found);
      } else {
        console.log('No user found with email:', signInEmail);
        Alert.alert('Not Found', 'No user found with that email. Please sign up first.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear timeout if still active
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (error.message.includes('Network request failed') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Unable to connect to the server')) {
        Alert.alert(
          'Server Unavailable',
          `Could not connect to the server at ${API_URL}.\n\n` +
          'Please ensure that:' + '\n' +
          '1. The server is running\n' +
          '2. The server address is correct\n' +
          '3. Your device is connected to the network',
          [
            {
              text: 'OK',
              onPress: () => setLoading(false)
            },
            {
              text: 'Try Again',
              onPress: () => handleSignIn()
            }
          ]
        );
      } else if (error.message.includes('timeout')) {
        Alert.alert(
          'Connection Timeout',
          'The server is taking too long to respond. Please try again later.',
          [
            {
              text: 'OK',
              onPress: () => setLoading(false)
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          `Failed to sign in: ${error.message || 'Unknown error'}`,
          [
            {
              text: 'OK',
              onPress: () => setLoading(false)
            }
          ]
        );
      }
    } finally {
      // Always ensure loading is set to false when done
      if (loading) {
        setLoading(false);
      }
    }
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Connecting to server...</Text>
        <Text style={styles.serverInfo}>Server: {API_URL}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f8f4e9' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: height, backgroundColor: '#f8f4e9' }}>
          {/* App name/logo */}
          <Text style={{
            fontSize: 42,
            fontWeight: '700',
            color: '#a67c52',
            marginTop: 140,
            letterSpacing: 1.5,
            textAlign: 'center',
            fontFamily: 'PlayfairDisplay-Bold',
            textTransform: 'none',
            textShadowColor: 'rgba(0, 0, 0, 0.1)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
            marginBottom: 10  // Added margin below the title
          }}>Cashly</Text>
          {/* Restructured Scrollable Carousel */}
          <View style={{ height: 280, marginTop: 10, width: '100%', marginBottom: 10 }}>
            <FlatList
              data={[
                { id: '1', emoji: '💸', title: 'YOUR MONEY, ORGANISED', quote: 'Financial freedom starts with a single step: Awareness' },
                { id: '2', emoji: '💰', title: 'YOUR MONEY, TRANSPARENT', quote: 'Know your worth, manage your wealth' },
                { id: '3', emoji: '🤑', title: 'YOUR MONEY, OPTIMISED', quote: 'Control your money, or it will control you' },
              ]}
              renderItem={({ item }: { item: { id: string; emoji: string; title: string; quote: string } }) => (
                <View style={{ width: width, height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36 }}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#f3e8d9', alignItems: 'center', justifyContent: 'center', shadowColor: '#a67c52', shadowOpacity: 0.08, shadowRadius: 20 }}>
                      <Text style={{ color: '#d2b48c', fontSize: 48 }}>{item.emoji}</Text>
                    </View>
                    <View style={{ minHeight: 40, justifyContent: 'center', marginTop: 10, width: '100%' }}>
                      <Text 
                        style={{ 
                          fontSize: 20, 
                          fontWeight: '600', 
                          color: '#cab08a', 
                          textAlign: 'center', 
                          letterSpacing: 1.5,
                          width: '100%',
                          paddingHorizontal: 20
                        }} 
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.9}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <View style={{ minHeight: 40, justifyContent: 'center', marginTop: 4 }}>
                      <Text style={{ fontSize: 15, color: '#cab08a', textAlign: 'center', lineHeight: 22 }} numberOfLines={2}>
                        {item.quote}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
              getItemLayout={(data, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 15 }}>
              {[...Array(3).keys()].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: i === activeIndex ? '#cab08a' : '#e6d3b3',
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          </View>
          {/* Input fields */}
          <View style={{ width: 300, marginBottom: 20, backgroundColor: 'transparent' }}>
            <TextInput
              style={[styles.input, { backgroundColor: '#fff9f4', borderColor: '#d7ccc8', color: '#5d4037' }]}
              placeholder="Your name"
              placeholderTextColor="#a1887f"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
            <TextInput
              style={[styles.input, { backgroundColor: '#fff9f4', borderColor: '#d7ccc8', color: '#5d4037', marginTop: 15 }]}
              placeholder="Email address"
              placeholderTextColor="#a1887f"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Create Account button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#ded0bc',
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 20,
              width: 300,
              shadowColor: '#cab08a',
              shadowOpacity: 0.12,
              shadowRadius: 10,
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={{ color: '#866e4b', fontWeight: '600', fontSize: 18 }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
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
          {/* Sign In Section */}
          <View style={{ width: 300, marginTop: 20, marginBottom: 40, alignItems: 'center' }}>
            <Text style={{ color: '#cab08a', fontSize: 15, textAlign: 'center' }}>
              Already have an account?{' '}
              <Text 
                style={{ color: '#8d6e63', fontWeight: '600', textDecorationLine: 'underline' }}
                onPress={() => navigation?.navigate('SignIn')}
              >
                Sign in
              </Text>
            </Text>
          </View>
        </View>
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
    marginBottom: 0,
    borderRadius: 8,
    backgroundColor: '#fff9f4',
    color: '#5d4037',
    fontSize: 16,
    width: '100%',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    color: '#8d6e63',
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f4e9',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#5d4037',
    textAlign: 'center',
    marginBottom: 10,
  },
  serverInfo: {
    fontSize: 12,
    color: '#8d6e63',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});