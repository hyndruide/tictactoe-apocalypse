import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GameStatus } from '../../domain/types';
import { PIPBOY_THEME } from '../theme';

export type StatusBarProps = {
  status: GameStatus;
};

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  if (status.kind !== 'PLAYING') {
    return null;
  }

  return (
    <View style={styles.container} testID="status-bar">
      <Text style={styles.text}>
        [STATUS] {`Tour de ${status.currentPlayer}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: PIPBOY_THEME.borderColor,
    backgroundColor: '#0a1008',
    marginBottom: 20,
    borderRadius: 4,
  },
  text: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: PIPBOY_THEME.fontSize.medium,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: PIPBOY_THEME.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
