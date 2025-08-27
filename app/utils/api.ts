import { NativeModules, Platform } from 'react-native';

/**
 * Resolve API base URL across platforms/environments.
 * Returns the full base including the "/api" suffix.
 */
export const getApiUrl = (): string => {
  // Prefer explicit env override
  const envUrl = process.env?.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    let url = envUrl.replace(/\/$/, '');
    if (!/\/api$/.test(url)) url += '/api';
    return url;
  }

  // Try to infer host from the Metro bundle URL (Expo Go on device)
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (scriptURL) {
      const { hostname } = new URL(scriptURL);
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:5001/api`;
      }
    }
  } catch {
    // ignore and fall back
  }

  // Simulator / web fallbacks
  const base = Platform.select({
    ios: 'http://localhost:5001',
    android: 'http://10.0.2.2:5001',
    default: 'http://localhost:5001',
  });
  return `${base}/api`;
};

export default getApiUrl;
