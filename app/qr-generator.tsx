import React from 'react';
import { StyleSheet, View, Text, Share, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';

export default function QRGenerator() {
  const router = useRouter();
  // This is the deep link that will open your app in Expo Go
  const expoDeepLink = 'exp://192.168.1.100:8081'; // Replace with your actual IP address

  const shareQRCode = async () => {
    try {
      await Share.share({
        message: `Scan this QR code to open the app in Expo Go: ${expoDeepLink}`,
        url: expoDeepLink,
      });
    } catch (error) {
      alert('Error sharing QR code');
    }
  };

  const saveQRCode = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to save the QR code!');
        return;
      }

      const qrCodeData = `data:image/png;base64,${await new Promise((resolve, reject) => {
        let svg = this.qrCodeRef.svg();
        svg.toDataURL((data) => {
          resolve(data);
        });
      })}`;

      const fileUri = FileSystem.cacheDirectory + 'expo-qr-code.png';
      
      await FileSystem.writeAsStringAsync(fileUri, qrCodeData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(fileUri);
      alert('QR code saved to your photos!');
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('Error saving QR code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan with Expo Go</Text>
      <Text style={styles.subtitle}>Scan this QR code with your phone's camera to open the app in Expo Go</Text>
      
      <View style={styles.qrContainer}>
        <QRCode
          value={expoDeepLink}
          size={200}
          color="black"
          backgroundColor="white"
          getRef={(ref) => (this.qrCodeRef = ref)}
        />
      </View>
      
      <Text style={styles.linkText}>{expoDeepLink}</Text>
      
      <TouchableOpacity style={styles.button} onPress={shareQRCode}>
        <Text style={styles.buttonText}>Share QR Code</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveQRCode}>
        <Text style={styles.buttonText}>Save to Photos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.backButton]} 
        onPress={() => router.back()}
      >
        <Text style={[styles.buttonText, { color: '#007AFF' }]}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linkText: {
    marginTop: 15,
    marginBottom: 30,
    color: '#007AFF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
