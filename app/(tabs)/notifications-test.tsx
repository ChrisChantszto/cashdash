import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as Notifications from 'expo-notifications';
import { 
  registerForPushNotificationsAsync, 
  scheduleLocalNotification,
  sendImmediateNotification,
  cancelAllNotifications,
  getRandomNotification,
  NOTIFICATION_TEMPLATES
} from '../utils/notifications';

// Set up notification response listener
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationsTestScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification response (e.g., navigate to a specific screen)
    });

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Send a test notification for a specific category
  const sendCategoryNotification = (category: keyof typeof NOTIFICATION_TEMPLATES) => {
    const notif = getRandomNotification(category);
    sendImmediateNotification(notif.title, notif.body, { category });
  };

  // Send a notification with a specific delay
  const scheduleNotification = async () => {
    try {
      const id = await scheduleLocalNotification(
        "Scheduled Reminder", 
        "This notification was scheduled to appear 10 seconds later!",
        10
      );
      Alert.alert("Notification Scheduled", `Notification will appear in 10 seconds. ID: ${id}`);
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      Alert.alert("Error", "Failed to schedule notification");
    }
  };

  // Test all notification types
  const testAllTypes = async () => {
    try {
      const categories = Object.keys(NOTIFICATION_TEMPLATES) as Array<keyof typeof NOTIFICATION_TEMPLATES>;
      
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const notif = getRandomNotification(category);
        await scheduleLocalNotification(
          notif.title,
          notif.body,
          3 + (i * 3), // Schedule 3 seconds apart
          { category }
        );
      }
      
      Alert.alert("Test Started", "You'll receive sample notifications from all categories in the next few seconds.");
    } catch (error) {
      console.error("Failed to test notifications:", error);
      Alert.alert("Error", "Failed to test notifications");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Notification Testing</ThemedText>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Device Status</ThemedText>
          <Text style={styles.tokenText}>
            {expoPushToken ? `Push token: ${expoPushToken.substring(0, 20)}...` : 'No push token available'}
          </Text>
          <Text style={styles.infoText}>
            {notification ? `Last notification: ${notification.request.content.title}` : 'No notification received yet'}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Test Notifications</ThemedText>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => sendImmediateNotification("Hello from Cashly!", "This is a test notification.")}
          >
            <Text style={styles.buttonText}>Send Basic Notification</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={scheduleNotification}
          >
            <Text style={styles.buttonText}>Schedule Notification (10s)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={testAllTypes}
          >
            <Text style={styles.buttonText}>Test All Notification Types</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => cancelAllNotifications()}
          >
            <Text style={styles.buttonText}>Cancel All Notifications</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notification Categories</ThemedText>
          
          <TouchableOpacity 
            style={[styles.button, styles.categoryButton]} 
            onPress={() => sendCategoryNotification('INACTIVITY')}
          >
            <Text style={styles.buttonText}>Inactivity Reminder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.categoryButton]} 
            onPress={() => sendCategoryNotification('ETHOS')}
          >
            <Text style={styles.buttonText}>Credibility Appeal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.categoryButton]} 
            onPress={() => sendCategoryNotification('PATHOS')}
          >
            <Text style={styles.buttonText}>Emotional Appeal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.categoryButton]} 
            onPress={() => sendCategoryNotification('LOGOS')}
          >
            <Text style={styles.buttonText}>Logical Appeal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5d4037',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e6d3b3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5d4037',
    marginBottom: 12,
  },
  tokenText: {
    fontSize: 14,
    color: '#8d6e63',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: 14,
    color: '#5d4037',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#8d6e63',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryButton: {
    backgroundColor: '#a1887f',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
