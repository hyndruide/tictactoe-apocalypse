import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { EndScreen } from '../EndScreen';

describe('EndScreen', () => {
  it('renders nothing when status is PLAYING', () => {
    const onReplay = jest.fn();
    const { queryByTestId } = render(
      <EndScreen status={{ kind: 'PLAYING', currentPlayer: 'X' }} onReplay={onReplay} />
    );

    expect(queryByTestId('end-screen')).toBeNull();
  });

  it('renders winning state and handles replay button', () => {
    const onReplay = jest.fn();
    const { getByText, getByTestId } = render(
      <EndScreen status={{ kind: 'WON', winner: 'X' }} onReplay={onReplay} />
    );

    expect(getByTestId('vault-boy-image')).toBeTruthy();
    expect(getByText('Joueur X a gagné !')).toBeTruthy();
    const replayButton = getByTestId('replay-button');
    expect(replayButton).toBeTruthy();

    fireEvent.press(replayButton);
    expect(onReplay).toHaveBeenCalledTimes(1);
  });

  it('renders draw state', () => {
    const onReplay = jest.fn();
    const { getByText, getByTestId } = render(
      <EndScreen status={{ kind: 'DRAW' }} onReplay={onReplay} />
    );

    expect(getByTestId('vault-boy-image')).toBeTruthy();
    expect(getByText('Match nul !')).toBeTruthy();
  });
});
