import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { CellIndex, CellValue } from '../../domain/types';
import { PIPBOY_THEME } from '../theme';

export type CellProps = {
  value: CellValue;
  index: CellIndex;
  onPress: (index: CellIndex) => void;
  disabled: boolean;
};

export const Cell: React.FC<CellProps> = ({ value, index, onPress, disabled }) => {
  return (
    <Pressable
      accessibilityLabel={`cell-${index}`}
      testID={`cell-${index}`}
      style={({ pressed }) => [
        styles.cell,
        value ? styles.occupiedCell : null,
        pressed ? styles.pressedCell : null,
      ]}
      onPress={() => onPress(index)}
      disabled={disabled}
    >
      <Text style={styles.text}>{value ?? ''}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 90,
    height: 90,
    borderWidth: PIPBOY_THEME.borderWidth,
    borderColor: PIPBOY_THEME.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PIPBOY_THEME.background,
    margin: 4,
  },
  occupiedCell: {
    backgroundColor: PIPBOY_THEME.primaryDim,
  },
  pressedCell: {
    backgroundColor: PIPBOY_THEME.primaryGlow,
  },
  text: {
    color: PIPBOY_THEME.primary,
    fontSize: PIPBOY_THEME.fontSize.cell,
    fontWeight: 'bold',
    fontFamily: PIPBOY_THEME.fontFamily,
    textShadowColor: PIPBOY_THEME.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
