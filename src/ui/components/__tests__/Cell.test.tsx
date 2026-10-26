import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Cell } from '../Cell';

describe('Cell Component', () => {
  it('renders an empty cell when value is null', () => {
    const onPressMock = jest.fn();
    const { getByTestId, queryByText } = render(
      <Cell index={0} value={null} onPress={onPressMock} disabled={false} />
    );

    const cell = getByTestId('cell-0');
    expect(cell).toBeTruthy();
    expect(queryByText('X')).toBeNull();
    expect(queryByText('O')).toBeNull();
  });

  it('renders value when provided', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Cell index={4} value="X" onPress={onPressMock} disabled={false} />
    );

    expect(getByText('X')).toBeTruthy();
  });

  it('triggers onPress with its index when clicked', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Cell index={2} value={null} onPress={onPressMock} disabled={false} />
    );

    fireEvent.press(getByTestId('cell-2'));
    expect(onPressMock).toHaveBeenCalledWith(2);
  });

  it('does not trigger onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Cell index={1} value="O" onPress={onPressMock} disabled={true} />
    );

    fireEvent.press(getByTestId('cell-1'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
