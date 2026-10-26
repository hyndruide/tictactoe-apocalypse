import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

describe('App Root', () => {
  it('renders root App without crashing', () => {
    const { getByTestId, getByText } = render(<App />);
    expect(getByTestId('game-screen')).toBeTruthy();
    expect(getByText(/TIC TAC TOE APOCALYPSE/)).toBeTruthy();
  });
});
