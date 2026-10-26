import { CellIndex, GameState, MoveError, Result } from '../domain/types';

export interface IGameUseCases {
  startGame(): GameState;
  playMove(state: GameState, index: CellIndex): Result<GameState, MoveError>;
  resetGame(): GameState;
}
