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

    if (room.isFull()) {
      console.log(`[DISCONNECT] Joueur ${socketId} a quitté la partie active ${room.code}. Fermeture immédiate.`);
      this.eventEmitter.emitToRoom(room.code, 'playerDisconnected', {
        message: 'Un joueur a quitté le relais radio.',
      });
      this.roomRepository.delete(room.code);
    } else {
      console.log(
        `[DISCONNECT] Hôte ${socketId} temporairement déconnecté du salon en attente ${room.code}. Préservation du salon pendant 180s...`
      );
      // Préserver le salon pour permettre le partage du code hors de l'application
      setTimeout(() => {
        const current = this.roomRepository.findByCode(room.code);
        if (current && current.guest === null) {
          console.log(`[CLEANUP] Salon ${room.code} expiré après 180s d'inactivité.`);
          this.roomRepository.delete(room.code);
        }
      }, 180000);
    }
  }
}
