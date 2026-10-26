import { act, renderHook } from '@testing-library/react-native';
import { useGameController } from '../useGameController';

describe('useGameController (UI Hook)', () => {
  it('initializes with an empty board and player X ready', () => {
    const { result } = renderHook(() => useGameController());

    expect(result.current.board.every((cell) => cell === null)).toBe(true);
    expect(result.current.status).toEqual({ kind: 'PLAYING', currentPlayer: 'X' });
  });

  it('updates board and alternates player upon valid move', () => {
    const { result } = renderHook(() => useGameController());

    act(() => {
      result.current.handleCellPress(0);
    });

    expect(result.current.board[0]).toBe('X');
    expect(result.current.status).toEqual({ kind: 'PLAYING', currentPlayer: 'O' });
  });

  it('ignores clicks on already occupied cells', () => {
    const { result } = renderHook(() => useGameController());

    act(() => {
      result.current.handleCellPress(0);
    });

    expect(result.current.board[0]).toBe('X');
    expect(result.current.status).toEqual({ kind: 'PLAYING', currentPlayer: 'O' });

    act(() => {
      result.current.handleCellPress(0);
    });

    expect(result.current.board[0]).toBe('X');
    expect(result.current.status).toEqual({ kind: 'PLAYING', currentPlayer: 'O' });
  });

  it('resets the board and player when handleReplay is called', () => {
    const { result } = renderHook(() => useGameController());

    // Play moves to win: X: 0, 1, 2; O: 3, 4
    act(() => {
      result.current.handleCellPress(0); // X
    });
    act(() => {
      result.current.handleCellPress(3); // O
    });
    act(() => {
      result.current.handleCellPress(1); // X
    });
    act(() => {
      result.current.handleCellPress(4); // O
    });
    act(() => {
      result.current.handleCellPress(2); // X wins
    });

    expect(result.current.status).toEqual({ kind: 'WON', winner: 'X' });

    act(() => {
      result.current.handleReplay();
    });

    expect(result.current.board.every((cell) => cell === null)).toBe(true);
    expect(result.current.status).toEqual({ kind: 'PLAYING', currentPlayer: 'X' });
  });
});
