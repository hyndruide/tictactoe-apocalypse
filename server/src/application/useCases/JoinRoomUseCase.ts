import { Player } from '../../domain/entities/Player';
import { IEventEmitter } from '../ports/IEventEmitter';
import { IRoomRepository } from '../ports/IRoomRepository';
import { normalizeRoomCode } from '../../domain/normalizeRoomCode';

export class JoinRoomUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly eventEmitter: IEventEmitter
  ) {}

  execute(socketId: string, roomCode: string): boolean {
    const rawTrimmed = (roomCode || '').trim().toUpperCase();
    const canonicalCode = normalizeRoomCode(roomCode);

    // Essayer le code canonique, puis le code brut si différent
    let room = this.roomRepository.findByCode(canonicalCode);
    if (!room && rawTrimmed && rawTrimmed !== canonicalCode) {
      room = this.roomRepository.findByCode(rawTrimmed);
    }

    if (!room) {
      console.warn(
        `[JOIN ROOM FAILED] socketId=${socketId} rawCode="${roomCode}" -> Canonical "${canonicalCode}" Not Found. Active rooms: ${this.roomRepository
          .getAll()
          .map((r) => r.code)
          .join(', ') || 'none'}`
      );
      this.eventEmitter.emitToSocket(socketId, 'error', {
        message: 'Fréquence de relais introuvable (Code invalide).',
      });
      return false;
    }

    if (room.isFull()) {
      console.warn(`[JOIN ROOM FULL] socketId=${socketId} roomCode="${room.code}" already full`);
      this.eventEmitter.emitToSocket(socketId, 'error', {
        message: 'Cette partie est déjà complète (2/2 joueurs).',
      });
      return false;
    }

    const guest = new Player(socketId, 'O');
    room.join(guest);
    this.roomRepository.save(room);

    this.eventEmitter.joinSocketToRoom(socketId, room.code);

    const currentTurn =
      room.gameBoard.status.kind === 'PLAYING'
        ? room.gameBoard.status.currentPlayer
        : 'X';

    console.log(`[JOIN ROOM SUCCESS] socketId=${socketId} joined room=${room.code} as player O`);

    // Notify guest
    this.eventEmitter.emitToSocket(socketId, 'roomJoined', {
      roomCode: room.code,
      player: 'O',
      board: room.gameBoard.board,
      currentTurn,
    });

    // Notify whole room that game has started
    this.eventEmitter.emitToRoom(room.code, 'gameStarted', {
      roomCode: room.code,
      player: 'O',
      board: room.gameBoard.board,
      currentTurn,
    });

    return true;
  }
}
