import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Board } from '../Board';
import { Board as BoardType } from '../../../domain/types';

describe('Board Component', () => {
  const emptyBoard: BoardType = [
    null, null, null,
    null, null, null,
    null, null, null,
  ];

  it('renders all 9 cells in the grid', () => {
    const onCellPress = jest.fn();
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellPress={onCellPress} disabled={false} />
    );

    for (let i = 0; i < 9; i++) {
      expect(getByTestId(`cell-${i}`)).toBeTruthy();
    }
  });

  it('handles cell press correctly', () => {
    const onCellPress = jest.fn();
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellPress={onCellPress} disabled={false} />
    );

    fireEvent.press(getByTestId('cell-3'));
    expect(onCellPress).toHaveBeenCalledWith(3);
  });
});
