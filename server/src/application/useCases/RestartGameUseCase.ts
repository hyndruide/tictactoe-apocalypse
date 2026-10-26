import { IEventEmitter } from '../ports/IEventEmitter';
import { IRoomRepository } from '../ports/IRoomRepository';
import { normalizeRoomCode } from '../../domain/normalizeRoomCode';

export class RestartGameUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly eventEmitter: IEventEmitter
  ) {}

  execute(socketId: string, roomCode: string): boolean {
    const code = normalizeRoomCode(roomCode);
    const room = this.roomRepository.findByCode(code) || this.roomRepository.findByCode(roomCode.trim().toUpperCase());

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
