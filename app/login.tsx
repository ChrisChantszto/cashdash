import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './LoginScreen';
import { useUser } from './UserContext';

export default function LoginPage() {
  const { setUser } = useUser();

  const handleLogin = (user: any) => {
    setUser(user);
  };

  return (
    <View style={styles.container}>
      <LoginScreen onLogin={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
  },
});
