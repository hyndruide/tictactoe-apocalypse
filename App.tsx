import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GameScreen } from './src/ui/screens/GameScreen';
import { PIPBOY_THEME } from './src/ui/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={PIPBOY_THEME.background} />
      <GameScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PIPBOY_THEME.background,
  },
});
