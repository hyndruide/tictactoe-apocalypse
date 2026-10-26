import { io, Socket } from 'socket.io-client';
import { CellIndex } from '../../domain/types';
import {
  ErrorEvent,
  GameStartedEvent,
  GameUpdatedEvent,
  ISocketGameClient,
  PlayerDisconnectedEvent,
  RoomCreatedEvent,
  SocketEventCallbacks,
} from './ISocketGameClient';

export class SocketGameClient implements ISocketGameClient {
  private socket: Socket | null = null;
  private callbacks: SocketEventCallbacks = {};

  connect(url: string, callbacks: SocketEventCallbacks): void {
    if (this.socket) {
      this.disconnect();
    }

    this.callbacks = callbacks;
    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.callbacks.onConnected?.();
    });

    this.socket.on('disconnect', () => {
      this.callbacks.onDisconnected?.();
    });

    this.socket.on('connect_error', () => {
      this.callbacks.onError?.({
        message: 'Impossible de contacter le relais radio Vault-Tec.',
      });
    });

    this.socket.on('roomCreated', (data: RoomCreatedEvent) => {
      this.callbacks.onRoomCreated?.(data);
    });

    this.socket.on('roomJoined', (data: GameStartedEvent) => {
      this.callbacks.onRoomJoined?.(data);
    });

    this.socket.on('gameStarted', (data: GameStartedEvent) => {
      this.callbacks.onGameStarted?.(data);
    });

    this.socket.on('gameUpdated', (data: GameUpdatedEvent) => {
      this.callbacks.onGameUpdated?.(data);
    });

    this.socket.on('playerDisconnected', (data: PlayerDisconnectedEvent) => {
      this.callbacks.onPlayerDisconnected?.(data);
    });

    this.socket.on('error', (data: ErrorEvent) => {
      this.callbacks.onError?.(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  createRoom(): void {
    this.socket?.emit('createRoom');
  }

  joinRoom(roomCode: string): void {
    this.socket?.emit('joinRoom', { roomCode: roomCode.trim().toUpperCase() });
  }

  playMove(roomCode: string, cellIndex: CellIndex): void {
    this.socket?.emit('playMove', { roomCode, cellIndex });
  }

  replay(roomCode: string): void {
    this.socket?.emit('replay', { roomCode });
  }

  leaveRoom(roomCode: string): void {
    this.socket?.emit('leaveRoom', { roomCode });
  }

  reconnectRoom(roomCode: string, player: 'X' | 'O'): void {
    this.socket?.emit('reconnectRoom', { roomCode, player });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const defaultSocketGameClient = new SocketGameClient();
