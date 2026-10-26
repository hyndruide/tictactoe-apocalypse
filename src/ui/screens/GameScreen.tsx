import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useGameController } from '../hooks/useGameController';
import { Board } from '../components/Board';
import { StatusBar } from '../components/StatusBar';
import { EndScreen } from './EndScreen';
import { OnlineGameScreen } from './OnlineGameScreen';
import { PIPBOY_THEME } from '../theme';

export const GameScreen: React.FC = () => {
  const [gameMode, setGameMode] = useState<'local' | 'online'>('local');
  const { board, status, handleCellPress, handleReplay } = useGameController();

  const isGameOver = status.kind !== 'PLAYING';

  if (gameMode === 'online') {
    return (
      <View style={styles.safeArea} testID="game-screen">
        <OnlineGameScreen onBackToLocal={() => setGameMode('local')} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} testID="game-screen">
      <View style={styles.container}>
        {/* Terminal Header */}
        <View style={styles.header}>
          <Text style={styles.systemTitle}>*** PIP-BOY 3000 MK IV ***</Text>
          <Text style={styles.gameTitle}>TIC TAC TOE APOCALYPSE</Text>
          <View style={styles.headerDivider} />
        </View>

        {/* Turn Status */}
        <StatusBar status={status} />

        {/* 3x3 Board */}
        <Board
          board={board}
          onCellPress={handleCellPress}
          disabled={isGameOver}
        />

        {/* Terminal Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>[RADS: 0.02 rad/s | HP: 100/100]</Text>
          <Text style={styles.footerSubText}>MODE: 1 VS 1 LOCAL PASS-AND-PLAY</Text>
          <Pressable
            style={({ pressed }) => [
              styles.onlineButton,
              pressed && styles.onlineButtonPressed,
            ]}
            testID="switch-to-online-button"
            accessibilityLabel="switch-to-online-button"
            onPress={() => setGameMode('online')}
          >
            <Text style={styles.onlineButtonText}>
              [ ACTIVER LE RELAIS EN LIGNE ]
            </Text>
          </Pressable>
        </View>

        {/* End Screen Overlay when game is won or draw */}
        {isGameOver && (
          <EndScreen status={status} onReplay={handleReplay} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PIPBOY_THEME.background,
  },
  container: {
    flex: 1,
    backgroundColor: PIPBOY_THEME.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  systemTitle: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 12,
    letterSpacing: 2,
    opacity: 0.8,
  },
  gameTitle: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: PIPBOY_THEME.fontSize.large,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: PIPBOY_THEME.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerDivider: {
    width: '90%',
    height: 1,
    backgroundColor: PIPBOY_THEME.primary,
    opacity: 0.5,
    marginTop: 10,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  footerText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 12,
    letterSpacing: 1,
  },
  footerSubText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
    letterSpacing: 1,
  },
  onlineButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: PIPBOY_THEME.borderColor,
    borderRadius: 4,
    backgroundColor: '#0a1008',
  },
  onlineButtonPressed: {
    backgroundColor: PIPBOY_THEME.primaryDim,
  },
  onlineButtonText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
