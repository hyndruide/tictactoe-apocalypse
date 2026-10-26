import { Server as SocketIOServer } from 'socket.io';
import { IEventEmitter } from '../../application/ports/IEventEmitter';

export class SocketIOEventEmitter implements IEventEmitter {
  constructor(private readonly io: SocketIOServer) {}

  emitToSocket(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  emitToRoom(roomCode: string, event: string, data: any): void {
    this.io.to(roomCode).emit(event, data);
  }

  joinSocketToRoom(socketId: string, roomCode: string): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(roomCode);
    }
  }

  leaveSocketFromRoom(socketId: string, roomCode: string): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(roomCode);
    }
  }
}
