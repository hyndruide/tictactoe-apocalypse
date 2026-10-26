import { Board, CellIndex, EMPTY_BOARD, GameStatus, PlayerSymbol, WIN_COMBINATIONS } from '../types';

export class GameBoard {
  private _board: Board = [...EMPTY_BOARD] as unknown as Board;
  private _status: GameStatus = { kind: 'PLAYING', currentPlayer: 'X' };

  get board(): Board {
    return this._board;
  }

  get status(): GameStatus {
    return this._status;
  }

  applyMove(index: CellIndex, player: PlayerSymbol): boolean {
    if (this._status.kind !== 'PLAYING') {
      return false;
    }
    if (this._status.currentPlayer !== player) {
      return false;
    }
    if (this._board[index] !== null) {
      return false;
    }

    const nextBoard = [...this._board] as unknown as [
      any, any, any, any, any, any, any, any, any
    ];
    nextBoard[index] = player;
    this._board = nextBoard as unknown as Board;

    if (this.checkWin(this._board, player)) {
      this._status = { kind: 'WON', winner: player };
      return true;
    }

    if (this._board.every((cell) => cell !== null)) {
      this._status = { kind: 'DRAW' };
      return true;
    }

    const nextPlayer: PlayerSymbol = player === 'X' ? 'O' : 'X';
    this._status = { kind: 'PLAYING', currentPlayer: nextPlayer };
    return true;
  }

  reset(): void {
    this._board = [...EMPTY_BOARD] as unknown as Board;
    this._status = { kind: 'PLAYING', currentPlayer: 'X' };
  }

  private checkWin(board: Board, player: PlayerSymbol): boolean {
    return WIN_COMBINATIONS.some(
      ([a, b, c]) => board[a] === player && board[b] === player && board[c] === player
    );
  }
}
