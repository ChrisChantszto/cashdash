import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithCredential,
  Auth,
  UserCredential,
  AuthProvider,
  AuthError,
  User,
  OAuthProvider
} from "firebase/auth";
import { Platform } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

// Default export for Expo Router
export default {};


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATBeXkwITLyj4T4IUezo3TKck-PQCkGmw",
  authDomain: "cashly-9cbc4.firebaseapp.com",
  projectId: "cashly-9cbc4",
  storageBucket: "cashly-9cbc4.firebasestorage.app",
  messagingSenderId: "66692307671",
  appId: "1:66692307671:web:6a52190ec20acc3649ae92",
  measurementId: "G-GBHMV6EVBE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Expo AuthSession for Google
WebBrowser.maybeCompleteAuthSession();

// Get Google client ID from environment variables
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Set up Google Auth Request hook
const useGoogleAuth = () => {
  return Google.useAuthRequest({
    clientId: webClientId || '',
    // For Expo Go, we can use the web client ID for all platforms
    // This simplifies setup when native client IDs aren't available
    scopes: ['profile', 'email']
  });
};

/**
 * Sign in with Google based on platform
 * - Web: Uses Firebase signInWithPopup
 * - Native: Uses Expo AuthSession
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    if (Platform.OS === 'web') {
      // Add scopes for email and profile
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      
      // Enable one-tap sign-in
      googleProvider.setCustomParameters({
        prompt: 'select_account',
        // The following parameters help with popup issues
        display: 'popup',
        // Disable redirect mode which can cause issues in Expo web
        redirect_uri: window.location.origin
      });
      
      console.log('Opening Google sign-in popup...');
      try {
        // First try with popup
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google sign-in successful');
        return result;
      } catch (popupError: any) {
        console.error('Popup error:', popupError);
        // If popup fails, we could try redirect method as fallback
        // But for now, just rethrow the error
        throw popupError;
      }
    } else {
      // For native platforms, use Expo AuthSession
      console.log('Using Expo AuthSession for Google Sign-In...');
      
      // Create a promise that will be resolved with the credential
      return new Promise(async (resolve, reject) => {
        try {
          // Create auth request
          const redirectUri = AuthSession.makeRedirectUri();
          const request = new AuthSession.AuthRequest({
            // Use web client ID for all platforms in Expo Go
            clientId: webClientId || '',
            scopes: ['profile', 'email'],
            redirectUri,
          });
          
          // Prompt user to authenticate
          const result = await request.promptAsync(Google.discovery);
          
          if (result.type === 'success') {
            // Get user info from Google
            const { id_token } = result.params;
            
            // Create a Google credential with the token
            const credential = GoogleAuthProvider.credential(id_token);
            
            // Sign in with credential
            const userCredential = await signInWithCredential(auth, credential);
            console.log('Google sign-in successful via Expo AuthSession');
            resolve(userCredential);
          } else {
            reject(new Error('Google Sign-In was cancelled or failed'));
          }
        } catch (error) {
          console.error('Expo AuthSession error:', error);
          reject(error);
        }
      });
    }
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    // Log more details about the error
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Export the hook for components that need direct access
export { useGoogleAuth };

/**
 * Extract user information from Firebase UserCredential
 */
export const extractUserInfo = (credential: UserCredential) => {
  const user = credential.user;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};
