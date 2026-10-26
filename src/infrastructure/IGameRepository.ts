import { GameState } from '../domain/types';

export interface IGameRepository {
  save(state: GameState): Promise<void>;
  load(): Promise<GameState | null>;
}
