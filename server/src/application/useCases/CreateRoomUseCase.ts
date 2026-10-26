import { Player } from '../../domain/entities/Player';
import { Room } from '../../domain/entities/Room';
import { IEventEmitter } from '../ports/IEventEmitter';
import { IRoomRepository } from '../ports/IRoomRepository';

export class CreateRoomUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly eventEmitter: IEventEmitter
  ) {}

  execute(socketId: string): Room {
    const code = this.generateRoomCode();
    const host = new Player(socketId, 'X');
    const room = new Room(code, host);

    this.roomRepository.save(room);
    this.eventEmitter.joinSocketToRoom(socketId, code);

    console.log(`[CREATE ROOM SUCCESS] socketId=${socketId} roomCode=${code}`);

    this.eventEmitter.emitToSocket(socketId, 'roomCreated', {
      roomCode: code,
      player: 'X',
    });

    return room;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'V-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
