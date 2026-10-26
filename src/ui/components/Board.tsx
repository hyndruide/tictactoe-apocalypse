import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Board as BoardType, CellIndex } from '../../domain/types';
import { PIPBOY_THEME } from '../theme';
import { Cell } from './Cell';

export type BoardProps = {
  board: BoardType;
  onCellPress: (index: CellIndex) => void;
  disabled: boolean;
};

export const Board: React.FC<BoardProps> = ({ board, onCellPress, disabled }) => {
  return (
    <View style={styles.container} testID="game-board">
      <View style={styles.grid}>
        {board.map((cellValue, index) => (
          <Cell
            key={index}
            index={index as CellIndex}
            value={cellValue}
            onPress={onCellPress}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderWidth: 2,
    borderColor: PIPBOY_THEME.borderColor,
    borderRadius: 8,
    backgroundColor: '#0a1008',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PIPBOY_THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  grid: {
    width: 296,
    height: 296,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
