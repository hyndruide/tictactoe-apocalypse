import { IRoomRepository } from '../../application/ports/IRoomRepository';
import { Room } from '../../domain/entities/Room';

export class InMemoryRoomRepository implements IRoomRepository {
  private rooms: Map<string, Room> = new Map();

  save(room: Room): void {
    this.rooms.set(room.code, room);
  }

  findByCode(code: string): Room | null {
    return this.rooms.get(code) || null;
  }

  findByPlayerId(playerId: string): Room | null {
    for (const room of this.rooms.values()) {
      if (room.hasPlayer(playerId)) {
        return room;
      }
    }
    return null;
  }

  delete(code: string): void {
    this.rooms.delete(code);
  }
}
