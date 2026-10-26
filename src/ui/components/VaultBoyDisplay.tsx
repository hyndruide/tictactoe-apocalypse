import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Player } from '../../domain/types';
import { PIPBOY_THEME } from '../theme';

export type VaultBoyDisplayProps = {
  result: { kind: 'WON'; winner: Player } | { kind: 'DRAW' };
};

const VAULT_BOY_TRIUMPHANT = `
     .------------------.
    /    .-""""""-.     \\
   |   .'          '.    |
   |  /   O      O   \\   |  (b)
   | |       __       |  | /
    \\ \\     '--'     /  / /
     '.'-.________.-'.'  /
      /  | VAULT  |  \\  /
     /   |  111   |   \\/
    |    |________|    |
`;

const VAULT_BOY_DRAW = `
     .------------------.
    /    .-""""""-.     \\
   |   .'          '.    |
   |  /   -      -   \\   |
   | |       ..       |  |
    \\ \\     '--'     /  /
     '.'-.________.-'.'
      /  | VAULT  |  \\
     /   |  111   |   \\
    |    |________|    |
`;

export const VaultBoyDisplay: React.FC<VaultBoyDisplayProps> = ({ result }) => {
  const isWon = result.kind === 'WON';
  const titleText = isWon
    ? `Joueur ${result.winner} a gagné !`
    : 'Match nul !';

  const subtitleText = isWon
    ? 'VAULT-TEC APPROVES YOUR TACTICAL SUPERIORITY'
    : 'STALEMATE: MUTUAL ASSURED DESTRUCTION';

  const asciiArt = isWon ? VAULT_BOY_TRIUMPHANT : VAULT_BOY_DRAW;

  return (
    <View style={styles.container} testID="vault-boy-display">
      <Text style={styles.badge}>=== VAULT-TEC OS ===</Text>
      <Text style={styles.ascii}>{asciiArt}</Text>
      <Text style={styles.title} testID="vault-boy-title">{titleText}</Text>
      <Text style={styles.subtitle}>{subtitleText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#0a1008',
    borderColor: PIPBOY_THEME.borderColor,
    borderWidth: 1,
    borderRadius: 8,
  },
  badge: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: PIPBOY_THEME.fontSize.small,
    letterSpacing: 2,
    marginBottom: 6,
  },
  ascii: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
    textShadowColor: PIPBOY_THEME.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  title: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: PIPBOY_THEME.fontSize.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
    textShadowColor: PIPBOY_THEME.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: PIPBOY_THEME.primary,
    fontFamily: PIPBOY_THEME.fontFamily,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.85,
    letterSpacing: 1,
  },
});
