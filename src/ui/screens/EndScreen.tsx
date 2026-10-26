import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameStatus } from '../../domain/types';
import { VaultBoyDisplay } from '../components/VaultBoyDisplay';
import { PIPBOY_THEME } from '../theme';

export type EndScreenProps = {
  status: GameStatus;
  onReplay: () => void;
};

export const EndScreen: React.FC<EndScreenProps> = ({ status, onReplay }) => {
  if (status.kind === 'PLAYING') {
    return null;
  }

  return (
    <View style={styles.overlay} testID="end-screen">
      <View style={styles.content}>
        <VaultBoyDisplay result={status} />

        <Pressable
          style={({ pressed }) => [
            styles.replayButton,
            pressed ? styles.replayButtonPressed : null,
          ]}
          onPress={onReplay}
          accessibilityLabel="replay-button"
          testID="replay-button"
        >
          <Text style={styles.replayText}>[ REJOUER ]</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  replayButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderWidth: PIPBOY_THEME.borderWidth,
    borderColor: PIPBOY_THEME.borderColor,
    backgroundColor: '#0a1008',
    borderRadius: 6,
    shadowColor: PIPBOY_THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  replayButtonPressed: {
    backgroundColor: PIPBOY_THEME.primaryDim,
  },
  replayText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: PIPBOY_THEME.fontSize.medium,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: PIPBOY_THEME.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
