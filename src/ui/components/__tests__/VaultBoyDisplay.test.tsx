import React from 'react';
import { render } from '@testing-library/react-native';
import { VaultBoyDisplay } from '../VaultBoyDisplay';

describe('VaultBoyDisplay Component', () => {
  it('displays victory message and vault boy image for Player X', () => {
    const { getByText, getByTestId } = render(
      <VaultBoyDisplay result={{ kind: 'WON', winner: 'X' }} />
    );

    expect(getByTestId('vault-boy-image')).toBeTruthy();
    expect(getByText('Joueur X a gagné !')).toBeTruthy();
    expect(getByText(/VAULT-TEC APPROVES/)).toBeTruthy();
  });

  it('displays victory message and vault boy image for Player O', () => {
    const { getByText, getByTestId } = render(
      <VaultBoyDisplay result={{ kind: 'WON', winner: 'O' }} />
    );

    expect(getByTestId('vault-boy-image')).toBeTruthy();
    expect(getByText('Joueur O a gagné !')).toBeTruthy();
  });

  it('displays stalemate message and vault boy image for draw', () => {
    const { getByText, getByTestId } = render(
      <VaultBoyDisplay result={{ kind: 'DRAW' }} />
    );

    expect(getByTestId('vault-boy-image')).toBeTruthy();
    expect(getByText('Match nul !')).toBeTruthy();
    expect(getByText(/STALEMATE/)).toBeTruthy();
  });
});
