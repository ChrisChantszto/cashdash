import { View, Text, StyleSheet } from 'react-native';

export default function SimpleTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Simple Test Screen</Text>
      <Text style={styles.subtext}>If you can see this, the app is rendering correctly!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333333',
  },
});
