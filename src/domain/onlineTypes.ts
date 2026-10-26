import { Board, CellIndex, GameStatus, Player } from './types';

export type OnlineConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'ERROR';

export type OnlineRoomPhase =
  | 'LOBBY'
  | 'WAITING_FOR_OPPONENT'
  | 'PLAYING'
  | 'GAME_OVER'
  | 'OPPONENT_DISCONNECTED';

export type OnlineGameState = {
  readonly connectionStatus: OnlineConnectionStatus;
  readonly roomPhase: OnlineRoomPhase;
  readonly roomCode: string | null;
  readonly myPlayer: Player | null;
  readonly currentTurn: Player | null;
  readonly board: Board;
  readonly status: GameStatus;
  readonly errorMessage: string | null;
};
