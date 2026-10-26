export type CellValue = 'X' | 'O' | null;

export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Player = 'X' | 'O';

export type Board = readonly [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue
];

export type GameStatus =
  | { kind: 'PLAYING'; currentPlayer: Player }
  | { kind: 'WON'; winner: Player }
  | { kind: 'DRAW' };

export type GameState = {
  readonly board: Board;
  readonly status: GameStatus;
};

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type MoveError = 'CELL_ALREADY_OCCUPIED' | 'GAME_ALREADY_OVER';
