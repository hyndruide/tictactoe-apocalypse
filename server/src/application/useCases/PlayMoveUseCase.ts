import { CellIndex } from '../../domain/types';
import { IEventEmitter } from '../ports/IEventEmitter';
import { IRoomRepository } from '../ports/IRoomRepository';

export class PlayMoveUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly eventEmitter: IEventEmitter
  ) {}

  execute(socketId: string, roomCode: string, cellIndex: CellIndex): boolean {
    const code = roomCode.trim().toUpperCase();
    const room = this.roomRepository.findByCode(code);

    if (!room) {
      this.eventEmitter.emitToSocket(socketId, 'error', {
        message: 'Salle introuvable.',
      });
      return false;
    }

    const player = room.getPlayer(socketId);
    if (!player) {
      this.eventEmitter.emitToSocket(socketId, 'error', {
        message: 'Vous ne faites pas partie de cette partie.',
      });
      return false;
    }

    const moveApplied = room.gameBoard.applyMove(cellIndex, player.symbol);
    if (!moveApplied) {
      return false;
    }

    this.roomRepository.save(room);

    const currentTurn = room.gameBoard.status.kind === 'PLAYING'
      ? room.gameBoard.status.currentPlayer
      : 'X';

    this.eventEmitter.emitToRoom(code, 'gameUpdated', {
      board: room.gameBoard.board,
      currentTurn,
      status: room.gameBoard.status,
    });

    return true;
  }
}
