import { IEventEmitter } from '../ports/IEventEmitter';
import { IRoomRepository } from '../ports/IRoomRepository';

export class HandleDisconnectUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly eventEmitter: IEventEmitter
  ) {}

  execute(socketId: string): void {
    const room = this.roomRepository.findByPlayerId(socketId);
    if (!room) {
      return;
    }

    this.eventEmitter.emitToRoom(room.code, 'playerDisconnected', {
      message: 'Un joueur a quitté le relais radio.',
    });

    this.roomRepository.delete(room.code);
  }
}
