export interface IEventEmitter {
  emitToSocket(socketId: string, event: string, data: any): void;
  emitToRoom(roomCode: string, event: string, data: any): void;
  joinSocketToRoom(socketId: string, roomCode: string): void;
  leaveSocketFromRoom(socketId: string, roomCode: string): void;
}
