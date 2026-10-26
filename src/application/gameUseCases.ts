import { applyMove, createInitialState } from '../domain/boardLogic';
import { CellIndex, GameState, MoveError, Result } from '../domain/types';
import { IGameUseCases } from './IGameUseCases';

export class GameUseCases implements IGameUseCases {
  startGame(): GameState {
    return createInitialState();
  }

  playMove(state: GameState, index: CellIndex): Result<GameState, MoveError> {
    return applyMove(state, index);
  }

  resetGame(): GameState {
    return createInitialState();
  }
}

export const defaultGameUseCases: IGameUseCases = new GameUseCases();
