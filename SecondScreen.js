import React from 'react';
import { View, Text, Button } from 'react-native';

export default function SecondScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>This is the Second Page</Text>
      <Button
        title="Go back to Home"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}
