import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Board } from '../components/Board';
import { EndScreen } from './EndScreen';
import { PIPBOY_THEME } from '../theme';
import {
  OnlineGameController,
  useOnlineGameController,
} from '../hooks/useOnlineGameController';
import { ISocketGameClient } from '../../infrastructure/network/ISocketGameClient';

export type OnlineGameScreenProps = {
  onBackToLocal: () => void;
  controller?: OnlineGameController;
  client?: ISocketGameClient;
};

export const OnlineGameScreen: React.FC<OnlineGameScreenProps> = ({
  onBackToLocal,
  controller: injectedController,
  client,
}) => {
  const defaultController = useOnlineGameController(client);
  const controller = injectedController || defaultController;

  const {
    state,
    serverUrl,
    setServerUrl,
    roomCodeInput,
    setRoomCodeInput,
    handleCreateRoom,
    handleJoinRoom,
    handleCellPress,
    handleReplay,
    handleLeaveRoom,
  } = controller;

  const isGameOver = state.roomPhase === 'GAME_OVER';
  const isMyTurn = state.currentTurn === state.myPlayer;

  return (
    <SafeAreaView style={styles.safeArea} testID="online-game-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.systemTitle}>*** PIP-BOY 3000 MK IV ***</Text>
            <Text style={styles.gameTitle}>RELAIS RADIO MULTIJOUEUR</Text>
            <Text style={styles.subHeader}>RÉSEAU QUANTIQUE DES TERRES DÉSOLÉES</Text>
            <View style={styles.headerDivider} />
          </View>

          {/* Error Banner */}
          {state.errorMessage && (
            <View style={styles.errorBox} testID="error-banner">
              <Text style={styles.errorText}>[ ALERTE : {state.errorMessage} ]</Text>
            </View>
          )}

          {/* PHASE 1: LOBBY & CODE ENTRY */}
          {state.roomPhase === 'LOBBY' && (
            <View style={styles.lobbyContainer} testID="lobby-view">
              <View style={styles.card}>
                <Text style={styles.cardTitle}>// REJOINDRE UNE PARTIE EXISTANTE</Text>
                <Text style={styles.label}>CODE DE PARTIE :</Text>
                <TextInput
                  style={styles.input}
                  testID="room-code-input"
                  accessibilityLabel="room-code-input"
                  value={roomCodeInput}
                  onChangeText={setRoomCodeInput}
                  placeholder="EX: VAULT-77"
                  placeholderTextColor="rgba(57, 255, 20, 0.35)"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  testID="join-room-button"
                  accessibilityLabel="join-room-button"
                  onPress={handleJoinRoom}
                >
                  <Text style={styles.buttonText}>[ REJOINDRE LA PARTIE ]</Text>
                </Pressable>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>// CRÉER UN NOUVEAU RELAIS</Text>
                <Text style={styles.cardHelp}>
                  Générez un code unique et transmettez-le à votre partenaire.
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  testID="create-room-button"
                  accessibilityLabel="create-room-button"
                  onPress={handleCreateRoom}
                >
                  <Text style={styles.buttonText}>[ CRÉER UNE PARTIE ]</Text>
                </Pressable>
              </View>

              {/* Server URL Config */}
              <View style={styles.serverConfigCard}>
                <Text style={styles.smallLabel}>ADRESSE DU RELAIS RADIO (SERVEUR) :</Text>
                <TextInput
                  style={styles.smallInput}
                  testID="server-url-input"
                  accessibilityLabel="server-url-input"
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
                testID="back-to-local-button"
                accessibilityLabel="back-to-local-button"
                onPress={onBackToLocal}
              >
                <Text style={styles.secondaryButtonText}>
                  « RETOUR AU MODE LOCAL (PASS & PLAY)
                </Text>
              </Pressable>
            </View>
          )}

          {/* PHASE 2: WAITING FOR OPPONENT */}
          {state.roomPhase === 'WAITING_FOR_OPPONENT' && (
            <View style={styles.waitingContainer} testID="waiting-view">
              <View style={styles.codeDisplayCard}>
                <Text style={styles.codeDisplayLabel}>VOTRE CODE DE PARTIE :</Text>
                <Text style={styles.codeDisplayText} testID="display-room-code">
                  {state.roomCode}
                </Text>
                <Text style={styles.codeDisplayHint}>
                  COMMUNIQUEZ CE CODE AU JOUEUR 2 POUR DÉMARRER LA SESSION.
                </Text>
              </View>

              <View style={styles.pulseContainer} testID="waiting-opponent">
                <Text style={styles.pulseText}>
                  [ SIGNAL ÉMIS... EN ATTENTE DE L'ADVERSAIRE ]
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                testID="cancel-room-button"
                accessibilityLabel="cancel-room-button"
                onPress={handleLeaveRoom}
              >
                <Text style={styles.cancelButtonText}>[ ANNULER LE RELAIS ]</Text>
              </Pressable>
            </View>
          )}

          {/* PHASE 3 & 4: PLAYING & GAME OVER */}
          {(state.roomPhase === 'PLAYING' || isGameOver) && (
            <View style={styles.gameContainer} testID="online-playing-view">
              {/* Game Metadata Header */}
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  SALLE : <Text style={styles.metaHighlight}>{state.roomCode}</Text>
                </Text>
                <Text style={styles.metaText} testID="my-player-indicator">
                  VOUS ÊTES : <Text style={styles.metaHighlight}>JOUEUR {state.myPlayer}</Text>
                </Text>
              </View>

              {/* Turn Indicator */}
              <View style={styles.turnBox}>
                {state.status.kind === 'PLAYING' && (
                  <Text
                    style={[
                      styles.turnText,
                      isMyTurn ? styles.turnMyTurn : styles.turnOpponentTurn,
                    ]}
                    testID={isMyTurn ? 'my-turn-indicator' : 'opponent-turn-indicator'}
                  >
                    {isMyTurn
                      ? `>>> À VOUS DE JOUER (${state.myPlayer}) <<<`
                      : `TOUR DE L'ADVERSAIRE (${state.currentTurn})...`}
                  </Text>
                )}
              </View>

              {/* 3x3 Board */}
              <Board
                board={state.board}
                onCellPress={handleCellPress}
                disabled={isGameOver || !isMyTurn}
              />

              {/* Leave Game button */}
              <Pressable
                style={({ pressed }) => [
                  styles.leaveButton,
                  pressed && styles.buttonPressed,
                ]}
                testID="leave-room-button"
                accessibilityLabel="leave-room-button"
                onPress={handleLeaveRoom}
              >
                <Text style={styles.leaveButtonText}>[ QUITTER LA PARTIE ]</Text>
              </Pressable>

              {/* End Screen Overlay on Won or Draw */}
              {isGameOver && (
                <EndScreen status={state.status} onReplay={handleReplay} />
              )}
            </View>
          )}

          {/* PHASE 5: OPPONENT DISCONNECTED */}
          {state.roomPhase === 'OPPONENT_DISCONNECTED' && (
            <View style={styles.disconnectContainer} testID="disconnected-view">
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>SIGNAL PERDU</Text>
                <Text style={styles.errorText} testID="opponent-disconnected-message">
                  L'adversaire a coupé la liaison radio ou s'est déconnecté.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                testID="return-lobby-button"
                accessibilityLabel="return-lobby-button"
                onPress={handleLeaveRoom}
              >
                <Text style={styles.buttonText}>[ RETOUR AU SALON EN LIGNE ]</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
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
  subHeader: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 10,
    letterSpacing: 1.5,
    opacity: 0.7,
    marginTop: 4,
  },
  headerDivider: {
    width: '90%',
    height: 1,
    backgroundColor: PIPBOY_THEME.primary,
    opacity: 0.5,
    marginTop: 10,
  },
  errorBox: {
    width: '100%',
    maxWidth: 360,
    padding: 12,
    backgroundColor: '#200808',
    borderColor: '#ff4444',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorTitle: {
    color: '#ff4444',
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  errorText: {
    color: '#ff6666',
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  lobbyContainer: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#0a1008',
    borderColor: PIPBOY_THEME.borderColor,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: PIPBOY_THEME.fontSize.small,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  cardHelp: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 11,
    opacity: 0.75,
    marginBottom: 12,
    lineHeight: 16,
  },
  label: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#000000',
    borderColor: PIPBOY_THEME.borderColor,
    borderWidth: 1.5,
    borderRadius: 4,
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    letterSpacing: 2,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#0a1008',
    borderColor: PIPBOY_THEME.borderColor,
    borderWidth: PIPBOY_THEME.borderWidth,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: PIPBOY_THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonPressed: {
    backgroundColor: PIPBOY_THEME.primaryDim,
  },
  buttonText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: PIPBOY_THEME.fontSize.medium,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  serverConfigCard: {
    width: '100%',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(57, 255, 20, 0.2)',
    marginBottom: 16,
  },
  smallLabel: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 10,
    opacity: 0.7,
    marginBottom: 4,
  },
  smallInput: {
    backgroundColor: '#0a1008',
    borderColor: 'rgba(57, 255, 20, 0.4)',
    borderWidth: 1,
    borderRadius: 4,
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 11,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 12,
    letterSpacing: 1,
    opacity: 0.85,
  },
  waitingContainer: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  codeDisplayCard: {
    width: '100%',
    backgroundColor: '#0a1008',
    borderColor: PIPBOY_THEME.borderColor,
    borderWidth: 2,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeDisplayLabel: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  codeDisplayText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginVertical: 6,
    textShadowColor: PIPBOY_THEME.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  codeDisplayHint: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 6,
  },
  pulseContainer: {
    padding: 12,
    marginBottom: 24,
  },
  pulseText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 12,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  cancelButton: {
    borderColor: '#ff4444',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#1a0808',
  },
  cancelButtonText: {
    color: '#ff6666',
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 13,
    letterSpacing: 1,
  },
  gameContainer: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  metaText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 12,
    letterSpacing: 1,
  },
  metaHighlight: {
    fontWeight: 'bold',
    textShadowColor: PIPBOY_THEME.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  turnBox: {
    marginVertical: 10,
    alignItems: 'center',
  },
  turnText: {
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: PIPBOY_THEME.fontSize.medium,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  turnMyTurn: {
    color: PIPBOY_THEME.primary,
    textShadowColor: PIPBOY_THEME.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  turnOpponentTurn: {
    color: 'rgba(57, 255, 20, 0.65)',
  },
  leaveButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.4)',
    borderRadius: 4,
    backgroundColor: '#0a1008',
  },
  leaveButtonText: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    opacity: 0.8,
  },
  disconnectContainer: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingVertical: 20,
  },
});
