import { Board, CellIndex, Player } from './types';

export const WIN_COMBINATIONS: readonly (readonly [CellIndex, CellIndex, CellIndex])[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const EMPTY_BOARD: Board = [
  null, null, null,
  null, null, null,
  null, null, null,
];

export const INITIAL_PLAYER: Player = 'X';
