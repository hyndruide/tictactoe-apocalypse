import React from 'react';
import { act, fireEvent, render, within } from '@testing-library/react-native';
import { GameScreen } from '../GameScreen';

describe('GameScreen Integration', () => {
  it('renders initial state with empty board and Tour de X', () => {
    const { getByText, getByTestId } = render(<GameScreen />);

    expect(getByText(/TIC TAC TOE APOCALYPSE/)).toBeTruthy();
    expect(getByText(/Tour de X/)).toBeTruthy();

    for (let i = 0; i < 9; i++) {
      expect(getByTestId(`cell-${i}`)).toBeTruthy();
    }
  });

  it('updates cell and changes turn to Tour de O after first move', () => {
    const { getByTestId, getByText } = render(<GameScreen />);

    act(() => {
      fireEvent.press(getByTestId('cell-0'));
    });

    expect(within(getByTestId('cell-0')).getByText('X')).toBeTruthy();
    expect(getByText(/Tour de O/)).toBeTruthy();
  });

  it('ignores press on already occupied cell', () => {
    const { getByTestId, getByText } = render(<GameScreen />);

    act(() => {
      fireEvent.press(getByTestId('cell-0')); // X plays cell 0
    });
    expect(within(getByTestId('cell-0')).getByText('X')).toBeTruthy();
    expect(getByText(/Tour de O/)).toBeTruthy();

    act(() => {
      fireEvent.press(getByTestId('cell-0')); // O attempts to play cell 0
    });
    expect(within(getByTestId('cell-0')).getByText('X')).toBeTruthy();
    expect(getByText(/Tour de O/)).toBeTruthy(); // Still O's turn
  });

  it('displays victory EndScreen when a player aligns 3 symbols and handles replay', () => {
    const { getByTestId, getByText, queryByTestId } = render(<GameScreen />);

    // Moves:
    // X: 0, 1, 2 (wins)
    // O: 3, 4
    act(() => {
      fireEvent.press(getByTestId('cell-0')); // X
    });
    act(() => {
      fireEvent.press(getByTestId('cell-3')); // O
    });
    act(() => {
      fireEvent.press(getByTestId('cell-1')); // X
    });
    act(() => {
      fireEvent.press(getByTestId('cell-4')); // O
    });
    act(() => {
      fireEvent.press(getByTestId('cell-2')); // X wins!
    });

    expect(getByTestId('end-screen')).toBeTruthy();
    expect(getByText('Joueur X a gagné !')).toBeTruthy();
    expect(getByTestId('replay-button')).toBeTruthy();

    // Click Replay
    act(() => {
      fireEvent.press(getByTestId('replay-button'));
    });

    // EndScreen should now be gone, board empty, Tour de X
    expect(queryByTestId('end-screen')).toBeNull();
    expect(getByText(/Tour de X/)).toBeTruthy();
    for (let i = 0; i < 9; i++) {
      expect(within(getByTestId(`cell-${i}`)).queryByText('X')).toBeNull();
      expect(within(getByTestId(`cell-${i}`)).queryByText('O')).toBeNull();
    }
  });

  it('displays draw EndScreen when board is full with no winner', () => {
    const { getByTestId, getByText } = render(<GameScreen />);

    // X O X
    // X O O
    // O X X
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    for (const cellIndex of moves) {
      act(() => {
        fireEvent.press(getByTestId(`cell-${cellIndex}`));
      });
    }

    expect(getByTestId('end-screen')).toBeTruthy();
    expect(getByText('Match nul !')).toBeTruthy();
  });
});
