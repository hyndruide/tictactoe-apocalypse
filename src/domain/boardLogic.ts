import { Board, CellIndex, CellValue, GameState, MoveError, Player, Result } from './types';
import { EMPTY_BOARD, INITIAL_PLAYER, WIN_COMBINATIONS } from './constants';

export function createInitialState(): GameState {
  return {
    board: [...EMPTY_BOARD] as unknown as Board,
    status: { kind: 'PLAYING', currentPlayer: INITIAL_PLAYER },
  };
}

export function checkWinner(board: Board, player: Player): boolean {
  return WIN_COMBINATIONS.some(
    ([a, b, c]) => board[a] === player && board[b] === player && board[c] === player
  );
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export function nextPlayer(current: Player): Player {
  return current === 'X' ? 'O' : 'X';
}

export function applyMove(
  state: GameState,
  index: CellIndex
): Result<GameState, MoveError> {
  if (state.status.kind !== 'PLAYING') {
    return { ok: false, error: 'GAME_ALREADY_OVER' };
  }

  if (state.board[index] !== null) {
    return { ok: false, error: 'CELL_ALREADY_OCCUPIED' };
  }

  const currentPlayer = state.status.currentPlayer;
  const newBoardArray = [...state.board] as CellValue[];
  newBoardArray[index] = currentPlayer;
  const newBoard = newBoardArray as unknown as Board;

  if (checkWinner(newBoard, currentPlayer)) {
    return {
      ok: true,
      value: {
        board: newBoard,
        status: { kind: 'WON', winner: currentPlayer },
      },
    };
  }

  if (isBoardFull(newBoard)) {
    return {
      ok: true,
      value: {
        board: newBoard,
        status: { kind: 'DRAW' },
      },
    };
  }

  return {
    ok: true,
    value: {
      board: newBoard,
      status: { kind: 'PLAYING', currentPlayer: nextPlayer(currentPlayer) },
    },
  };
}
