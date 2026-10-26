import { Player } from '../../domain/entities/Player';
import { IEventEmitter } from '../ports/IEventEmitter';
import { IRoomRepository } from '../ports/IRoomRepository';

export class JoinRoomUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly eventEmitter: IEventEmitter
  ) {}

  execute(socketId: string, roomCode: string): boolean {
    const code = roomCode.trim().toUpperCase();
    const room = this.roomRepository.findByCode(code);

    if (!room) {
      this.eventEmitter.emitToSocket(socketId, 'error', {
        message: 'Fréquence de relais introuvable (Code invalide).',
      });
      return false;
    }

    if (room.isFull()) {
      this.eventEmitter.emitToSocket(socketId, 'error', {
        message: 'Cette partie est déjà complète (2/2 joueurs).',
      });
      return false;
    }

    const guest = new Player(socketId, 'O');
    room.join(guest);
    this.roomRepository.save(room);

    this.eventEmitter.joinSocketToRoom(socketId, code);

    const currentTurn = room.gameBoard.status.kind === 'PLAYING'
      ? room.gameBoard.status.currentPlayer
      : 'X';

    // Notify guest
    this.eventEmitter.emitToSocket(socketId, 'roomJoined', {
      roomCode: code,
      player: 'O',
      board: room.gameBoard.board,
      currentTurn,
    });

    // Notify whole room that game has started
    this.eventEmitter.emitToRoom(code, 'gameStarted', {
      roomCode: code,
      player: 'O',
      board: room.gameBoard.board,
      currentTurn,
    });

    return true;
  }
}
