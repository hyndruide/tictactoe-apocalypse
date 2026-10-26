import React from 'react';
import { render } from '@testing-library/react-native';
import { VaultBoyDisplay } from '../VaultBoyDisplay';

describe('VaultBoyDisplay Component', () => {
  it('displays victory message for Player X', () => {
    const { getByText } = render(
      <VaultBoyDisplay result={{ kind: 'WON', winner: 'X' }} />
    );

    expect(getByText('Joueur X a gagné !')).toBeTruthy();
    expect(getByText(/VAULT-TEC APPROVES/)).toBeTruthy();
  });

  it('displays victory message for Player O', () => {
    const { getByText } = render(
      <VaultBoyDisplay result={{ kind: 'WON', winner: 'O' }} />
    );

    expect(getByText('Joueur O a gagné !')).toBeTruthy();
  });

  it('displays stalemate message for draw', () => {
    const { getByText } = render(
      <VaultBoyDisplay result={{ kind: 'DRAW' }} />
    );

    expect(getByText('Match nul !')).toBeTruthy();
    expect(getByText(/STALEMATE/)).toBeTruthy();
  });
});
