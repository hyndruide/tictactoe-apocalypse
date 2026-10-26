import { Board, CellIndex, GameStatus, Player } from '../../domain/types';

export type RoomCreatedEvent = {
  roomCode: string;
  player: Player;
};

export type GameStartedEvent = {
  roomCode: string;
  player: Player;
  board: Board;
  currentTurn: Player;
};

export type GameUpdatedEvent = {
  board: Board;
  currentTurn: Player;
  status: GameStatus;
};

export type PlayerDisconnectedEvent = {
  message: string;
};

export type ErrorEvent = {
  message: string;
};

export type SocketEventCallbacks = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onRoomCreated?: (data: RoomCreatedEvent) => void;
  onRoomJoined?: (data: GameStartedEvent) => void;
  onGameStarted?: (data: GameStartedEvent) => void;
  onGameUpdated?: (data: GameUpdatedEvent) => void;
  onPlayerDisconnected?: (data: PlayerDisconnectedEvent) => void;
  onError?: (data: ErrorEvent) => void;
};

export interface ISocketGameClient {
  connect(url: string, callbacks: SocketEventCallbacks): void;
  disconnect(): void;
  createRoom(): void;
  joinRoom(roomCode: string): void;
  playMove(roomCode: string, cellIndex: CellIndex): void;
  replay(roomCode: string): void;
  leaveRoom(roomCode: string): void;
  isConnected(): boolean;
}
