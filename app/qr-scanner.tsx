import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

export default function QRScanner() {
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    Alert.alert(
      'QR Code Scanned!',
      `Data: ${data}\nType: ${type}`,
      [
        {
          text: 'OK',
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  if (!permission) {
    return <View style={styles.container}><Text>Requesting for camera permission...</Text></View>;
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to access the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        style={styles.camera}
      >
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}>
            <View style={[styles.unfocused, styles.topLeft]} />
            <View style={styles.middle}>
              <View style={styles.unfocused} />
              <View style={styles.focused}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />
              </View>
              <View style={styles.unfocused} />
            </View>
            <View style={[styles.unfocused, styles.bottomLeft]} />
          </View>
          <Text style={styles.scanText}>Scan a QR Code</Text>
        </View>
      </CameraView>
      
      {scanned && (
        <TouchableOpacity onPress={() => setScanned(false)} style={styles.button}>
          <Text style={styles.buttonText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={[styles.button, { backgroundColor: '#ff3b30' }]}
      >
        <Text style={styles.buttonText}>Close Scanner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unfocusedContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  unfocused: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  topLeft: {
    flex: 0.3,
  },
  bottomLeft: {
    flex: 0.3,
  },
  middle: {
    flexDirection: 'row',
    flex: 0.4,
  },
  focused: {
    width: 250,
    height: 250,
    borderWidth: 0,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: '#fff',
    width: 40,
    height: 40,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: '#fff',
    width: 40,
    height: 40,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#fff',
    width: 40,
    height: 40,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#fff',
    width: 40,
    height: 40,
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    backgroundColor: 'transparent',
    textAlign: 'center',
    padding: 10,
    borderRadius: 5,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
