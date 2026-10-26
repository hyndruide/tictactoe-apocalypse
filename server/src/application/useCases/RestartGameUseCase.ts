import { IEventEmitter } from '../ports/IEventEmitter';
import { IRoomRepository } from '../ports/IRoomRepository';

export class RestartGameUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly eventEmitter: IEventEmitter
  ) {}

  execute(socketId: string, roomCode: string): boolean {
    const code = roomCode.trim().toUpperCase();
    const room = this.roomRepository.findByCode(code);

    if (!room || !room.hasPlayer(socketId)) {
      return false;
    }

    room.gameBoard.reset();
    this.roomRepository.save(room);

    this.eventEmitter.emitToRoom(code, 'gameUpdated', {
      board: room.gameBoard.board,
      currentTurn: 'X',
      status: room.gameBoard.status,
    });

    return true;
  }
}
