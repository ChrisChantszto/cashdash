import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function SimpleTestLayout() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Simple Test Layout</Text>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Simple Test' }} />
      </Stack>
    </View>
  );
}
