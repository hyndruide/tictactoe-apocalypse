import React from 'react';
import { render } from '@testing-library/react-native';
import { StatusBar } from '../StatusBar';

describe('StatusBar Component', () => {
  it('displays turn for Player X', () => {
    const { getByText } = render(
      <StatusBar status={{ kind: 'PLAYING', currentPlayer: 'X' }} />
    );

    expect(getByText(/Tour de X/)).toBeTruthy();
  });

  it('displays turn for Player O', () => {
    const { getByText } = render(
      <StatusBar status={{ kind: 'PLAYING', currentPlayer: 'O' }} />
    );

    expect(getByText(/Tour de O/)).toBeTruthy();
  });

  it('returns null when game is WON or DRAW', () => {
    const { queryByTestId: queryWon } = render(
      <StatusBar status={{ kind: 'WON', winner: 'X' }} />
    );
    expect(queryWon('status-bar')).toBeNull();

    const { queryByTestId: queryDraw } = render(
      <StatusBar status={{ kind: 'DRAW' }} />
    );
    expect(queryDraw('status-bar')).toBeNull();
  });
});
