import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Notification templates for Cashly
export const NOTIFICATION_TEMPLATES = {
  // Inactivity notifications
  INACTIVITY: [
    {
      title: "Cashly Misses You!",
      body: "Your money's waiting! Log your expenses today to stay on track."
    },
    {
      title: "Budget Check-in Time",
      body: "Don't let your budget slip away—check in with Cashly now!"
    },
    {
      title: "Money Moves Paused?",
      body: "Missing your money moves? Let's catch up and save more."
    },
    {
      title: "Cashly Check-in",
      body: "Tracking paused? Log in now to keep your cash flow in control."
    }
  ],
  
  // Persuasive appeals - Ethos (Credibility)
  ETHOS: [
    {
      title: "Expert Finance Tip",
      body: "Top financial experts say: Daily expense tracking boosts savings by 20%. Keep logging with Cashly!"
    },
    {
      title: "Join Thousands of Savers",
      body: "Trusted by thousands—logging expenses helps avoid overspending. Join them today!"
    }
  ],
  
  // Persuasive appeals - Pathos (Emotion)
  PATHOS: [
    {
      title: "Feel the Progress",
      body: "Every penny counts—visualise your progress and feel the power of saving."
    },
    {
      title: "Watch Your Money Grow",
      body: "See your money grow instead of disappear. Start tracking your spending now."
    }
  ],
  
  // Persuasive appeals - Logos (Logic/Stats)
  LOGOS: [
    {
      title: "Saving Success Stats",
      body: "80% of successful savers log expenses daily. Simple tracking = big results."
    },
    {
      title: "5-Minute Money Hack",
      body: "Only 5 minutes a day prevents 30% more overspending. Cashly makes it easy!"
    }
  ]
};

// Get a random notification from a specific category
export const getRandomNotification = (category: keyof typeof NOTIFICATION_TEMPLATES) => {
  const templates = NOTIFICATION_TEMPLATES[category];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
};

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;
  
  // Check if device is physical (not simulator/emulator)
  if (Constants.isDevice) {
    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get Expo push token
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
    
    console.log('Push token:', token);
  } else {
    console.log('Must use physical device for push notifications');
  }

  // Set up notification channels for Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// Simple function to show an alert (fallback when notifications fail)
function showAlert(title: string, body: string) {
  Alert.alert(title, body);
}

// Request notification permissions
export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === 'granted';
  }
  return true;
}

// Schedule a local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds: number = 5,
  data: Record<string, any> = {}
) {
  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('No notification permission');
      showAlert(title, body);
      return null;
    }
    
    // Schedule the notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // null trigger = show immediately
    });
    
    console.log('Notification scheduled with ID:', identifier);
    return identifier;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    showAlert(title, body);
    return null;
  }
}

// Send a notification immediately
export async function sendImmediateNotification(
  title: string,
  body: string,
  data: Record<string, any> = {}
) {
  return scheduleLocalNotification(title, body, 1, data);
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All scheduled notifications canceled');
}

// Test function to send a notification from each category
export async function testAllNotificationTypes() {
  const categories = Object.keys(NOTIFICATION_TEMPLATES) as Array<keyof typeof NOTIFICATION_TEMPLATES>;
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const notification = getRandomNotification(category);
    await scheduleLocalNotification(
      notification.title,
      notification.body,
      5 + (i * 5) // Schedule 5 seconds apart
    );
  }
  
  console.log('Test notifications scheduled for all categories');
}
