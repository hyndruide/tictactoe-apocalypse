import { GameUseCases } from '../gameUseCases';

describe('GameUseCases (Application)', () => {
  let useCases: GameUseCases;

  beforeEach(() => {
    useCases = new GameUseCases();
  });

  it('starts a new game with an empty board and X starting', () => {
    const state = useCases.startGame();
    expect(state.board.every((cell) => cell === null)).toBe(true);
    expect(state.status).toEqual({ kind: 'PLAYING', currentPlayer: 'X' });
  });

  it('plays a valid move delegating to domain logic', () => {
    const initialState = useCases.startGame();
    const result = useCases.playMove(initialState, 0);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.board[0]).toBe('X');
      expect(result.value.status).toEqual({ kind: 'PLAYING', currentPlayer: 'O' });
    }
  });

  it('returns an error when playing on an occupied cell', () => {
    const initialState = useCases.startGame();
    const move1 = useCases.playMove(initialState, 0);
    expect(move1.ok).toBe(true);

    if (move1.ok) {
      const move2 = useCases.playMove(move1.value, 0);
      expect(move2.ok).toBe(false);
      if (!move2.ok) {
        expect(move2.error).toBe('CELL_ALREADY_OCCUPIED');
      }
    }
  });

  it('resets the game returning a fresh initial state without mutating the old one', () => {
    const initialState = useCases.startGame();
    const moveResult = useCases.playMove(initialState, 4);
    expect(moveResult.ok).toBe(true);

    const resetState = useCases.resetGame();
    expect(resetState.board.every((cell) => cell === null)).toBe(true);
    expect(resetState.status).toEqual({ kind: 'PLAYING', currentPlayer: 'X' });

    if (moveResult.ok) {
      expect(moveResult.value.board[4]).toBe('X');
    }
  });
});
