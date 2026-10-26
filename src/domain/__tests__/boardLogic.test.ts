import { applyMove, createInitialState } from '../boardLogic';
import { Board, GameState } from '../types';

describe('BoardLogic (Domain)', () => {
  it('creates initial state with 9 null cells and player X starting', () => {
    const state = createInitialState();
    expect(state.board).toEqual([
      null, null, null,
      null, null, null,
      null, null, null,
    ]);
    expect(state.status).toEqual({ kind: 'PLAYING', currentPlayer: 'X' });
  });

  it('applies a valid move and switches player', () => {
    const state = createInitialState();
    const result = applyMove(state, 4);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.board[4]).toBe('X');
      expect(result.value.status).toEqual({ kind: 'PLAYING', currentPlayer: 'O' });
    }
  });

  it('rejects a move on an already occupied cell', () => {
    const state = createInitialState();
    const firstMove = applyMove(state, 4);
    expect(firstMove.ok).toBe(true);

    if (firstMove.ok) {
      const secondMove = applyMove(firstMove.value, 4);
      expect(secondMove.ok).toBe(false);
      if (!secondMove.ok) {
        expect(secondMove.error).toBe('CELL_ALREADY_OCCUPIED');
      }
    }
  });

  it('detects a victory when 3 symbols are aligned', () => {
    const board: Board = [
      'X', 'X', null,
      'O', 'O', null,
      null, null, null,
    ];
    const state: GameState = {
      board,
      status: { kind: 'PLAYING', currentPlayer: 'X' },
    };

    const result = applyMove(state, 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toEqual({ kind: 'WON', winner: 'X' });
      expect(result.value.board[2]).toBe('X');
    }
  });

  it('detects a draw when all cells are filled with no winner', () => {
    const board: Board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', null,
    ];
    const state: GameState = {
      board,
      status: { kind: 'PLAYING', currentPlayer: 'X' },
    };

    const result = applyMove(state, 8);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toEqual({ kind: 'DRAW' });
      expect(result.value.board[8]).toBe('X');
    }
  });

  it('rejects a move if game is already over', () => {
    const board: Board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null,
    ];
    const state: GameState = {
      board,
      status: { kind: 'WON', winner: 'X' },
    };

    const result = applyMove(state, 5);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('GAME_ALREADY_OVER');
    }
  });

  it('guarantees immutability of the state', () => {
    const state = createInitialState();
    const originalBoard = [...state.board];

    const result = applyMove(state, 0);
    expect(result.ok).toBe(true);
    expect(state.board).toEqual(originalBoard);
  });
});
