export type CellValue = 'X' | 'O' | null;

export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PlayerSymbol = 'X' | 'O';

export type Board = readonly [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue
];

export type GameStatus =
  | { kind: 'PLAYING'; currentPlayer: PlayerSymbol }
  | { kind: 'WON'; winner: PlayerSymbol }
  | { kind: 'DRAW' };

export const EMPTY_BOARD: Board = [
  null, null, null,
  null, null, null,
  null, null, null,
];

export const WIN_COMBINATIONS: readonly (readonly [CellIndex, CellIndex, CellIndex])[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];
